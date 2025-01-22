import { io, Socket } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io();
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};