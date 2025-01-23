"use client";

import Link from "next/link";
import { useDictionary } from "./DictionaryProvider";

export default function Navbar() {
  let dict = useDictionary();
  const locale = dict._lang;

  return (
    <div className="fixed top-0 left-0 w-full h-14 flex items-center px-6 bg-black/40 backdrop-blur-md z-50">
      <Link href={`/${locale}/`} className="logo text-2xl">buzz</Link>
    </div>
  );
}