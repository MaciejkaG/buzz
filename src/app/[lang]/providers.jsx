"use client";

import { HeroUIProvider } from "@heroui/react";
import { DictionaryProvider } from "@/components/DictionaryProvider";

export function Providers({ children, lang, dictionary }) {
  return (
    <HeroUIProvider>
      <DictionaryProvider lang={lang} dictionary={dictionary}>
        {children}
      </DictionaryProvider>
    </HeroUIProvider>
  );
}
