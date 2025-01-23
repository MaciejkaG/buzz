"use client";

import { initSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import "@/styles/host.css";

export default function Join() {
  const router = useRouter();

  useEffect(() => {
    const socket = initSocket();

    // If user is not joined to a room, move him to the landing page.
    socket.emit("is-joined", (joined) => !joined && router.push('/'));

    return () => {
      
    };
  }, []);

  return (
    <div>
    </div>
  );
}
