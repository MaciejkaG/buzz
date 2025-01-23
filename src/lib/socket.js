'use client';

import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io();
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.close();
    socket = io();
  }
}