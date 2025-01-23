"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const gradientVariants = {
  landing: {
    opacity: 1,
    transition: { duration: 1 },
  },
  exit: {
    opacity: .5,
    transition: { duration: 3 },
  },
};

const gradient1Variants = {
  animate: {
    top: ["0", "calc(100vh - 30rem)", "calc(100vh - 30rem)", "0", "0"],
    left: ["0", "calc(100vw - 30rem)", "0", "calc(100vw - 30rem)", "0"],
    transition: {
      times: [0, 0.25, 0.5, 0.75, 1],
      duration: 30,
      repeat: Infinity,
      ease: ["easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut"],
      repeatType: "loop",
    },
  },
  static: {
    top: "0",
    left: "0",
    transition: {
      duration: 3,
      ease: "easeInOut",
    },
  },
};

const gradient2Variants = {
  animate: {
    top: ["0", "calc(100vh - 30rem)", "calc(100vh - 30rem)", "0", "0"],
    left: [
      "calc(100vw - 30rem)",
      "0",
      "calc(100vw - 30rem)",
      "0",
      "calc(100vw - 30rem)",
    ],
    transition: {
      times: [0, 0.25, 0.5, 0.75, 1],
      duration: 30,
      repeat: Infinity,
      ease: ["easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut"],
      repeatType: "loop",
    },
  },
  static: {
    top: "0",
    left: "calc(100vw - 30rem)",
    transition: {
      duration: 3,
      ease: "easeInOut",
    },
  },
};

const gradient3Variants = {
  animate: {
    top: ["0", "0", "calc(100vh - 30rem)", "0"],
    left: ["calc(50vw - 15rem)"],
    transition: {
      times: [0, 0.25, 0.75, 1],
      duration: 30,
      repeat: Infinity,
      ease: ["easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut"],
      repeatType: "loop",
    },
  },
  static: {
    top: "calc(100vh - 30rem)",
    left: "calc(50vw - 15rem)",
    transition: {
      duration: 3,
      ease: "easeInOut",
    },
  },
};

export default function Background() {
  const pathname = usePathname();
  const [isLandingPage, setIsLandingPage] = useState(pathname === "/");

  useEffect(() => {
    setIsLandingPage(pathname === "/");
  }, [pathname]);

  const baseGradientStyle = {
    width: "30rem",
    aspectRatio: "1",
    position: "absolute",
    willChange: "transform", // Optimize performance
  };

  return (
    <div className="fixed w-full h-screen top-0 left-0 overflow-hidden flex pointer-events-none -z-10">
      <AnimatePresence>
        <motion.div
          variants={gradientVariants}
          animate={isLandingPage ? "landing" : "exit"}
        >
          <motion.div
            className="bg-red-500 blur-[15rem]"
            style={baseGradientStyle}
            variants={gradient1Variants}
            animate={isLandingPage ? "animate" : "static"}
          />
          <motion.div
            className="bg-sky-500 blur-[15rem]"
            style={baseGradientStyle}
            variants={gradient2Variants}
            animate={isLandingPage ? "animate" : "static"}
          />
          <motion.div
            className="bg-indigo-500 blur-[15rem]"
            style={baseGradientStyle}
            variants={gradient3Variants}
            animate={isLandingPage ? "animate" : "static"}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
