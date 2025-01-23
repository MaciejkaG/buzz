import Link from "next/link";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 w-full h-14 flex items-center px-6 bg-black/40 backdrop-blur-md z-50">
      <Link href={'/'} className="logo text-2xl">buzz</Link>
    </div>
  );
}