"use client";

import { cn } from "./utils";
import type { HTMLMotionProps, Variants } from "framer-motion";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface InfoCircleIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface InfoCircleIconProps extends HTMLMotionProps<"div"> {
 size?: number;
 duration?: number;
 isAnimated?: boolean;
}

const InfoCircleIcon = forwardRef<InfoCircleIconHandle, InfoCircleIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 18,
   duration = 1,
   isAnimated = true,
   ...props
  },
  ref,
 ) => {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () =>
     reduced ? controls.start("normal") : controls.start("animate"),
    stopAnimation: () => controls.start("normal"),
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) controls.start("animate");
    else onMouseEnter?.(e as any);
   },
   [controls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
  );

  const iconVariants: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  return (
   <motion.div
    className={cn("inline-flex items-center justify-center", className)}
    onMouseEnter={handleEnter}
    onMouseLeave={handleLeave}
    {...props}
   >
    <motion.svg
     xmlns="http://www.w3.org/2000/svg"
     width={size}
     height={size}
     viewBox="0 0 24 24"
     fill="none"
     animate={controls}
     initial="normal"
     variants={iconVariants}
    >
     <motion.circle cx="12" cy="12" r="10" fill="currentColor" />
     <motion.circle cx="12" cy="7.2" r="1.3" fill="white" />
     <motion.path
      d="M12 10.5V16.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
     />
    </motion.svg>
   </motion.div>
  );
 },
);

InfoCircleIcon.displayName = "InfoCircleIcon";
export { InfoCircleIcon };
