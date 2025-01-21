'use client';

import '@/components/home.css';

import { Button, Divider, Input } from '@heroui/react';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex">
      <div className="bg-color animation-1 bg-red-500 blur-[15rem] absolute"></div>
      <div className="bg-color animation-2 bg-sky-500 blur-[15rem] absolute"></div>
      <div className="bg-color animation-3 bg-indigo-500 blur-[15rem] absolute"></div>

      <div className="z-10 flex-1 flex flex-col gap-4 justify-center items-center text-center">
        <h1 className="text-3xl font-semibold">Najlepszy system buzzerów</h1>
        <p className="text-lg">Bez logowania. Bez opłat. Zawsze.</p>
      </div>
      <div className="z-10 flex-1 bg-black/60 flex flex-col justify-center items-center gap-3 text-center">
        <h2 className="text-2xl">Dołącz</h2>
        <p>Masz już kod? Możesz dołączyć do sesji poniżej.</p>
        <div className="flex gap-2">
          <Input className="w-64" label="Kod pokoju" type="text" />
          <Input className="w-64" label="Nickname" type="text" maxLength={16} />
        </div>
        <Button>Dołącz</Button>
        <Divider className="my-3 w-[60%]" />
        <h2 className="text-2xl">Stwórz</h2>
        <p>Możesz stworzyć sesję i zaprosić do niej graczy.</p>
        <Button>Stwórz</Button>
      </div>
    </div>
  );
}
