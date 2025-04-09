import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MalayalamSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  colorful?: boolean;
}

export function MalayalamSpinner({
  className,
  size = "md",
  text = "സംസാരിക്കുന്നു", // Malayalam for "Translating"
  colorful = true,
}: MalayalamSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Malayalam script-inspired spinner elements
  const spinnerElements = [
    "മ", "ല", "യ", "ാ", "ള", "ം"  // Malayalam letters
  ];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        {/* Outer circle */}
        <motion.div
          className={cn(
            "rounded-full border-2 border-primary/30",
            sizeMap[size]
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Spinning Malayalam letters around the circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          {spinnerElements.map((char, index) => (
            <motion.div
              key={index}
              className={cn(
                "absolute font-bold",
                colorful ? "text-primary" : "text-foreground",
                size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
              )}
              initial={{ 
                opacity: 0.2,
                x: Math.cos(index * (Math.PI * 2) / spinnerElements.length) * (size === "sm" ? 8 : size === "md" ? 16 : 24),
                y: Math.sin(index * (Math.PI * 2) / spinnerElements.length) * (size === "sm" ? 8 : size === "md" ? 16 : 24)
              }}
              animate={{ 
                opacity: [0.2, 1, 0.2], 
                rotate: 360,
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatType: "loop",
                delay: index * 0.15,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
            >
              {char}
            </motion.div>
          ))}
          
          {/* Kerala-themed inner decorative element */}
          <motion.div
            className="absolute"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <motion.div 
              className={cn(
                "absolute rounded-full border-2 border-primary/40",
                size === "sm" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-7 w-7"
              )}
              style={{ 
                borderStyle: "dotted"
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.9, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className={cn(
                "absolute bg-primary/20 rotate-45",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 0.7, 0.4],
                rotate: [45, 135, 45]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Text below the spinner */}
      {text && (
        <motion.p 
          className={cn(
            "text-center font-medium",
            colorful ? "text-primary" : "text-foreground",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}