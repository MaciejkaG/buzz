"use client";

// This is used to provide transition between pages to the app.

import { motion } from "framer-motion";

export default function Transition({ children }) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
