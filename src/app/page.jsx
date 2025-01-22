"use client";

import Background from "@/components/background";
import "@/styles/home.css";

import { Button, Divider, Form, Input } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    const socket = initSocket();

    socket.emit("join-room", { roomId: roomId.toUpperCase(), nickname });

    socket.on("lock-update", ({ isLocked }) => {
      setIsLocked(isLocked);
    });

    socket.on("buzzer-reset", () => {
      setHasBuzzed(false);
    });

    socket.on("kicked", () => {
      router.push("/");
    });

    socket.on("host-disconnected", () => {
      router.push("/");
    });

    setStep("buzzer");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex">
      <div className="z-10 flex-1 flex flex-col gap-4 justify-center items-center text-center">
        <h1 className="text-3xl font-semibold">Najlepszy system buzzerów</h1>
        <p className="text-lg">Bez logowania. Bez opłat. Zawsze.</p>
      </div>
      <div className="z-10 flex-1 bg-black/60 flex flex-col justify-center items-center gap-3 text-center">
        <h2 className="text-2xl">Dołącz</h2>
        <p>Masz już kod? Możesz dołączyć do pokoju poniżej.</p>
        <div className="flex gap-2">
          <Form>
            <Input className="w-64" label="Kod pokoju" type="text" />
            <Input
              className="w-64"
              label="Nickname"
              type="text"
              maxLength={16}
            />
          </Form>
        </div>
        <Button>Dołącz</Button>
        <Divider className="my-3 w-[60%]" />
        <h2 className="text-2xl">Stwórz</h2>
        <p>Możesz stworzyć pokój i zaprosić do niego graczy.</p>
        <Button onPress={() => router.push('/host')}>Stwórz</Button>
      </div>
    </div>
  );
}
