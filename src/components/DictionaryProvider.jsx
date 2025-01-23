"use client";

import React, { createContext, useContext } from "react";

const DictionaryContext = createContext();

export const DictionaryProvider = ({ lang, dictionary, children }) => {
  dictionary._lang = lang;

  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
};
