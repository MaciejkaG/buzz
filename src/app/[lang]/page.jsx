"use client";

import { useDictionary } from "@/components/DictionaryProvider";

import "@/styles/home.css";

import { Button, Divider, Input, Form } from "@heroui/react";
import useLocaleRouter from "@/lib/locale-router";
import { useState } from "react";
import { initSocket } from "@/lib/socket";

export default function Home() {
  let dict = useDictionary();

  const locale = dict._lang;
  dict = dict.landing;
  
  const router = useLocaleRouter(locale);

  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    const socket = initSocket();

    socket.emit("join-room", { roomId: roomId.toUpperCase(), nickname }, (success) => {
      if (success) router.push('/join');
      else alert("Nie udało się dołączyć do pokoju.");
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
      <div className="z-10 mt-14 py-6 min-h-fit md:flex-1 flex flex-col gap-4 justify-center items-center text-center">
        <h1 className="text-3xl font-semibold">{dict.title}</h1>
        <p className="text-lg">{dict.subtitle}</p>
      </div>
      <div className="z-10 flex-1 bg-black/60 flex flex-col justify-center items-center gap-3 text-center">
        {/* Join room */}
        <h2 className="text-2xl">{dict.menu.join.title}</h2>
        <p>{dict.menu.join.subtitle}</p>
        <Form onSubmit={handleJoin} className="items-center">
          <div className="flex flex-wrap justify-center gap-2">
            <Input
              className="w-64"
              label={dict.menu.join.roomCode}
              type="text"
              autoComplete="off"
              value={roomId}
              maxLength={8}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            />
            <Input
              className="w-64"
              label={dict.menu.join.nickname}
              type="text"
              maxLength={16}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <Button type="submit">{dict.menu.join.button}</Button>
        </Form>
        <Divider className="my-3 w-[60%]" />

        {/* Create room */}
        <h2 className="text-2xl">{dict.menu.create.title}</h2>
        <p>{dict.menu.create.subtitle}</p>
        <Button onPress={() => router.push("/host")}>{dict.menu.create.button}</Button>
      </div>
    </div>
  );
}
