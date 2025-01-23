import "dotenv/config";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { createClient } from "redis";

import { genRoomId } from "./utils/helpers.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port, turbopack: true });
const handler = app.getRequestHandler();

// Setup Redis and clean possible residues
const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));
await redis.connect();

const prefixes = ["buzz:room:*"];
prefixes.forEach((prefix) => {
  redis.eval(
    `for _,k in ipairs(redis.call('keys', '${prefix}')) do redis.call('del', k) end`,
    0
  );
});

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    let roomId, nickname, isHost;

    // Periodically measure RTT.
    // Apply a small delay first to ensure the client connection has stabilised.
    const measureRTT = () => {
      const syncStartTime = Date.now();
      socket.emit("sync-time", syncStartTime);

      socket.once("sync-response", () => {
        const syncEndTime = Date.now();
        const roundTrip = syncEndTime - syncStartTime;
        const latency = roundTrip / 2;
        const offset = -latency;
        socket.data.timeOffset = offset; // Save the calculated offset
      });
    };

    setTimeout(measureRTT, 3000);
    setInterval(measureRTT, 10000);

    // Host handlers
    socket.on("create-room", async (callback) => {
      if (roomId) return;

      const newRoomId = genRoomId();
      callback(newRoomId);

      // Create the room in Redis
      await redis.json.set(`buzz:room:${newRoomId}`, "$", {
        players: [],
        buzzes: [],
        settings: {
          isJoiningLocked: false,
          isBuzzingLocked: false,

          latencyCorrection: true,
        },
      });

      socket.join(newRoomId);
      roomId = newRoomId;
      isHost = true;
    });

    socket.on("kick-player", async ({ playerIndex }) => {
      if (!isHost || !roomId) return;

      const player = (
        await redis.json.get(`buzz:room:${roomId}`, {
          path: `$.players[${playerIndex}]`,
        })
      )[0];
      if (!player) return; // If the player doesn't exist, return
      const playerSocketId = player.sid;

      // Pop the player from the array
      await redis.json.arrPop(`buzz:room:${roomId}`, "$.players", playerIndex);

      // Remove the player from the room and notify about the kick.
      io.in(playerSocketId).socketsLeave(roomId);
      io.to(playerSocketId).emit("kicked");

      // Get current player's list and populate it.
      const players = (
        await redis.json.get(`buzz:room:${roomId}`, {
          path: "$.players",
        })
      )[0];

      const playerNames = players.map((el) => el.nickname);
      io.to(roomId).emit("playerlist-update", { players: playerNames });
    });

    socket.on("setting-change", async ({ key, value }) => {
      const allowedSettingKeys = ["isJoiningLocked", "latencyCorrection"];

      value = value ? true : false; // Ensure value is a boolean.

      if (!isHost || !roomId || !allowedSettingKeys.includes(key)) return;

      // Change the setting
      await redis.json.set(
        `buzz:room:${roomId}`,
        `$.settings.${key}`,
        value
      );
    });

    socket.on("toggle-buzzer-lock", async () => {
      if (!isHost || !roomId) return;

      // Get roomData
      const roomData = await redis.json.get(`buzz:room:${roomId}`);

      // Invert the lock
      await redis.json.set(
        `buzz:room:${roomId}`,
        "$.settings.isBuzzingLocked",
        !roomData.settings.isBuzzingLocked
      );

      // Populate the change
      io.to(roomId).emit("buzzer-lock-update", { isLocked: !roomData.settings.isBuzzingLocked });
    });

    socket.on("reset-buzzers", async () => {
      if (!isHost || !roomId) return;

      // Clear the buzzes array
      await redis.json.set(`buzz:room:${roomId}`, "$.buzzes", []);

      // Populate the change
      io.to(roomId).emit("buzzer-reset");
    });

    // "Client" handlers
    socket.on("buzzer-info", async (callback) => {
      if (!roomId || isHost) {
        callback(null);
        return;
      }

      const roomData = await redis.json.get(`buzz:room:${roomId}`);
      callback({ isLocked: roomData.settings.isBuzzingLocked });
    });

    socket.on(
      "join-room",
      async ({ roomId: targetRoomId, nickname: targetNickname }, callback) => {
        // Validate input
        if (
          typeof targetRoomId !== "string" ||
          typeof targetNickname !== "string"
        )
          return;
        targetRoomId = targetRoomId.trim();
        targetNickname = targetNickname.trim();

        if (
          roomId ||
          targetRoomId.length !== 8 ||
          targetNickname.length > 16 ||
          targetNickname.length < 3
        )
          return;

        // Validate the room
        const roomData = await redis.json.get(`buzz:room:${targetRoomId}`);

        if (!roomData || roomData.settings.isJoiningLocked) {
          callback(false);
          return;
        }

        // Join the player
        roomData.players.push({ sid: socket.id, nickname: targetNickname });
        await redis.json.set(
          `buzz:room:${targetRoomId}`,
          "$.players",
          roomData.players
        );

        socket.join(targetRoomId);
        roomId = targetRoomId;
        nickname = targetNickname;

        const playerNames = roomData.players.map((el) => el.nickname);
        io.to(targetRoomId).emit("playerlist-update", { players: playerNames });
        callback(true);
      }
    );

    // Process buzzes with applied latency correction.
    socket.on("buzz", async () => {
      const correctedTime = Date.now() - (socket.data.timeOffset || 0);

      if (isHost || !roomId) return;

      // If the player has already buzzed, ignore.
      const playerHasBuzzed = (await redis.json.get(`buzz:room:${roomId}`, { path: "$.buzzes" }))[0].filter(x => x.sid === socket.id).length > 0;
      if (playerHasBuzzed) return;

      // Append player's buzz to the list.
      await redis.json.arrAppend(`buzz:room:${roomId}`, "$.buzzes", { nickname, sid: socket.id, realTime: correctedTime });

      // Populate current buzzes list.
      const buzzes = (await redis.json.get(`buzz:room:${roomId}`, { path: "$.buzzes" }))[0];
      io.to(roomId).emit("buzzes-update", { buzzes });
    });

    // When player is kicked, reset their socket variables.
    socket.onAnyOutgoing((eventName) => {
      switch (eventName) {
        case "kicked":
          roomId = undefined;
          isHost = false;
          break;

        default:
          break;
      }
    });

    // Universal quit handler
    const quitHandler = async ({ pathname }) => {
      if (!roomId) return;

      if (isHost) {
        io.to(roomId).emit("host-quit");

        await redis.json.del(`buzz:room:${roomId}`);

        // Disconnect sockets from the room.
        io.in(roomId).socketsLeave(roomId);
      } else {
        // Ignore if user went to the buzzer page (after joining from landing)
        const regex = /^\/[a-zA-Z]+\/?join$/i; // Matches /en/join, /pl/join etc.
        if (regex.test(pathname)) return;

        const roomData = await redis.json.get(`buzz:room:${roomId}`);
        if (!roomData) return;

        roomData.players = roomData.players.filter((a) => a.sid !== socket.id);
        await redis.json.set(
          `buzz:room:${roomId}`,
          "$.players",
          roomData.players
        );

        // Make the socket leave the room
        socket.leave(roomId);

        // Notify the room about a playerlist update
        const playerNames = roomData.players.map((el) => el.nickname);
        io.to(roomId).emit("playerlist-update", { players: playerNames });
      }

      roomId = undefined;
      isHost = false;
    };

    socket.on("disconnect", quitHandler);
    socket.on("page-changed", quitHandler);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
