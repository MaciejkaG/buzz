"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initSocket } from "@/lib/socket";

export function RouteChangeListener() {
  const pathname = usePathname();

  useEffect(() => {
    const socket = initSocket();
    socket.emit('page-changed', { pathname });
  }, [pathname]);

  return <></>;
}