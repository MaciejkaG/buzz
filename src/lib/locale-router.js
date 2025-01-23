"use client";

import { useRouter } from "next/navigation";

export default function useLocaleRouter(locale) {
  const router = useRouter();

  const push = (path) => {
    // Prepend the current locale if not already present
    const fullPath = `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
    console.log(fullPath);
    router.push(fullPath);
  };

  return { ...router, push };
}
