'use client';

import '@/components/home.css';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex">
      <div className="bg-color animation-1 -z-10 bg-red-500 blur-[15rem] absolute"></div>
      <div className="bg-color animation-2 -z-10 bg-sky-500 blur-[15rem] absolute"></div>
      <div className="bg-color animation-3 -z-10 bg-indigo-500 blur-[15rem] absolute"></div>

      <div className='flex-1 flex flex-col gap-4 justify-center items-center text-center'>
        <h1 className="text-3xl font-semibold">Najlepszy system buzzerów</h1>
        <p className="text-lg">Bez logowania. Bez opłat. Zawsze.</p>
      </div>
      <div className='flex-1 bg-black/60 flex justify-center items-center text-center'>
        <h2 className='text-2xl'>Dołącz</h2>
        
      </div>
    </div>
  );
}
