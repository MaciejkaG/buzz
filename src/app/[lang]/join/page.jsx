"use client";

import { getSocket, initSocket } from "@/lib/socket";
import { useDictionary } from "@/components/DictionaryProvider";
import useLocaleRouter from "@/lib/locale-router";
import { useEffect, useState } from "react";

export default function Join() {
  let dict = useDictionary();
  const locale = dict._lang;
  dict = dict.join;

  const router = useLocaleRouter(locale);

  const [buzzerLocked, setBuzzerLocked] = useState(true);
  const [buzzerActive, setBuzzerActive] = useState(false);

  const [touchscreenDetected, setTouchscreenDetected] = useState(false);

  useEffect(() => {
    const socket = initSocket();

    // If user is not joined to a room, move him to the landing page.
    socket.emit("buzzer-info", (data) => {
      if (!data) {
        router.push("/");
        return;
      }

      setBuzzerLocked(data.isLocked);
    });

    socket.on("sync-time", (serverTime) => {
      socket.emit("sync-response", Date.now());
    });

    socket.on("kicked", () => {
      router.push("/");
    });

    socket.on("host-quit", () => {
      router.push("/");
    });

    socket.on("buzzer-lock-update", ({ isLocked }) => {
      setBuzzerLocked(isLocked);
    });

    socket.on("buzzer-reset", () => {
      setBuzzerActive(false);
    });

    return () => {
      socket.off("kicked");
      socket.off("host-quit");
      socket.off("buzzer-lock-update");
      socket.off("buzzer-reset");
    };
  }, []);

  const handleBuzz = () => {
    const socket = getSocket();
    socket.emit("buzz");
    setBuzzerActive(true);
  };

  return (
    <div
      onMouseDown={() => {
        if (!touchscreenDetected) handleBuzz();
      }}
      onTouchStart={() => {
        handleBuzz();
        setTouchscreenDetected(true);
      }}
      className={`select-none relative w-screen h-screen overflow-hidden transition-colors-opacity duration-75 flex flex-col gap-4 justify-center items-center text-center ${
        buzzerLocked || buzzerActive ? "bg-red-700/20" : "bg-red-700"
      }`}
    >
      <h2 className="text-2xl">
        {(buzzerLocked
          ? dict.buzzerLocked
          : buzzerActive
          ? dict.buzzerActivated
          : dict.buzzerOnline).split("\n").map((item, index) => <span key={index}>{item}<br /></span>)}
      </h2>
    </div>
  );
}
