'use client';

import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = newSocket();
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.off("sync-time");
    socket.close();

    socket = newSocket();
  }
}

// Helper function.
function newSocket() {
  const socket = io();

  // realTime sync handler is baked into the socket whenever it is used.
  socket.on("sync-time", () => {
    socket.emit("sync-response");
  });

  return socket;
}