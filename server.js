import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    let roomId, isHost;

    socket.on('create-room', (callback) => {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      callback(newRoomId);

      roomId = newRoomId;
      isHost = true;
    });

    socket.on('disconnect', () => {
      io.to(roomId).emit('kicked');
    });
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
