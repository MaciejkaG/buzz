import '@/components/home.css';

export default function Home() {
  return (
    <div>
      <div className="block overflow-scroll w-full h-screen">
        <div className="w-96 h-96 bg-red-500 blur-[15rem] absolute animation-1"></div>
        <div className="w-96 h-96 bg-cyan-500 blur-[15rem] absolute animation-2"></div>
      </div>
    </div>
  );
}
