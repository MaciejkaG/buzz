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

    // Host handlers
    socket.on("create-room", async (callback) => {
      if (roomId) return;

      const newRoomId = genRoomId();
      callback(newRoomId);

      // Create the room in Redis
      await redis.json.set(`buzz:room:${newRoomId}`, "$", {
        players: [],
        buzzes: [],
        isLocked: false,
      });

      socket.join(newRoomId);
      roomId = newRoomId;
      isHost = true;
    });

    // "Client" handlers
    socket.on("is-joined", (callback) => {
      callback(roomId && !isHost);
    });

    socket.on("join-room", async ({ roomId: targetRoomId, nickname: targetNickname }, callback) => {
      // Validate input
      if (typeof targetRoomId !== "string" || typeof targetNickname !== "string")
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

      if (!roomData || roomData.isLocked) {
        callback(false);
        return;
      }

      // Join the player
      roomData.players.push({ sid: socket.id, nickname: targetNickname })
      await redis.json.set(`buzz:room:${targetRoomId}`, '$.players', roomData.players)

      socket.join(targetRoomId);
      roomId = targetRoomId;
      nickname = targetNickname;

      const playerNames = roomData.players.map(el => el.nickname);
      io.to(targetRoomId).emit('playerlist-update', { players: playerNames });
      callback(true);
    });

    // Universal quit handler
    const quitHandler = async ({ pathname }) => {
      if (!roomId) return;

      if (isHost) {
        io.to(roomId).emit("host-quit");

        await redis.json.del(`buzz:room:${roomId}`);

        // Disconnect sockets from the room.
        io.in(roomId).socketsLeave(roomId);

        roomId = undefined;
        isHost = false;
      } else {
        // Ignore if user went to the buzzer page (after joining from landing)
        if (pathname === '/join') return;

        const roomData = await redis.json.get(`buzz:room:${roomId}`);
        if (!roomData) return;

        roomData.players = roomData.players.filter((a) => a.sid !== socket.id);
        await redis.json.set(
          `buzz:room:${roomId}`,
          "$.players",
          roomData.players
        );

        const playerNames = roomData.players.map((el) => el.nickname);
        io.to(roomId).emit("playerlist-update", { players: playerNames });
      }
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
