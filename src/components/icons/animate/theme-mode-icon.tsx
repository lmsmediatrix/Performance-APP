"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./utils";

interface ThemeModeIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  isDarkMode: boolean;
}

export function ThemeModeIcon({
  size = 16,
  isDarkMode,
  className,
  ...props
}: ThemeModeIconProps) {
  const reduced = useReducedMotion();

  const springTransition = { type: "spring" as const, stiffness: 260, damping: 22 };
  const instantTransition = { duration: 0 };
  const transition = reduced ? instantTransition : springTransition;

  return (
    <motion.div className={cn("inline-flex items-center justify-center", className)} {...props}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: isDarkMode ? -12 : 12 }}
        transition={transition}
      >
        <motion.circle
          cx="12"
          cy="12"
          r="4.5"
          animate={{
            scale: isDarkMode ? 0.15 : 1,
            opacity: isDarkMode ? 0 : 1,
          }}
          transition={transition}
        />

        <motion.g
          animate={{
            opacity: isDarkMode ? 1 : 0,
            scale: isDarkMode ? 1 : 0.65,
            x: isDarkMode ? 0 : 2.5,
          }}
          transition={transition}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </motion.g>

        <motion.g
          animate={{
            opacity: isDarkMode ? 0 : 1,
            scale: isDarkMode ? 0.65 : 1,
          }}
          transition={transition}
        >
          <line x1="12" y1="1.5" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22.5" y2="12" />
          <line x1="4.3" y1="4.3" x2="6.1" y2="6.1" />
          <line x1="17.9" y1="17.9" x2="19.7" y2="19.7" />
          <line x1="4.3" y1="19.7" x2="6.1" y2="17.9" />
          <line x1="17.9" y1="6.1" x2="19.7" y2="4.3" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
