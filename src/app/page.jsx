"use client";

import "@/styles/home.css";

import { Button, Divider, Input, Form } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initSocket } from "@/lib/socket";

export default function Home() {
  const router = useRouter();

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
    <div className="relative w-full h-screen overflow-hidden flex">
      <div className="z-10 flex-1 flex flex-col gap-4 justify-center items-center text-center">
        <h1 className="text-3xl font-semibold">Najlepszy system buzzerów</h1>
        <p className="text-lg">Bez logowania. Bez opłat. Zawsze.</p>
      </div>
      <div className="z-10 flex-1 bg-black/60 flex flex-col justify-center items-center gap-3 text-center">
        {/* Join room */}
        <h2 className="text-2xl">Dołącz</h2>
        <p>Masz już kod? Możesz dołączyć do pokoju poniżej.</p>
        <Form onSubmit={handleJoin} className="items-center">
          <div className="flex gap-2">
            <Input
              className="w-64"
              label="Kod pokoju"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            />
            <Input
              className="w-64"
              label="Nickname"
              type="text"
              maxLength={16}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <Button type="submit">Dołącz</Button>
        </Form>
        <Divider className="my-3 w-[60%]" />

        {/* Create room */}
        <h2 className="text-2xl">Stwórz</h2>
        <p>Możesz stworzyć pokój i zaprosić do niego graczy.</p>
        <Button onPress={() => router.push("/host")}>Stwórz</Button>
      </div>
    </div>
  );
}
