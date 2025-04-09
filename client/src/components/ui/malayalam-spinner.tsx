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
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.2, 1, 0.2], 
                rotate: [0, 360],
                x: Math.cos(index * (Math.PI * 2) / spinnerElements.length) * (size === "sm" ? 8 : size === "md" ? 16 : 24),
                y: Math.sin(index * (Math.PI * 2) / spinnerElements.length) * (size === "sm" ? 8 : size === "md" ? 16 : 24)
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: index * 0.1,
                ease: "easeInOut"
              }}
            >
              {char}
            </motion.div>
          ))}
          
          {/* Inner decorative element */}
          <motion.div 
            className={cn(
              "absolute rounded-full bg-primary/20",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-4 w-4" : "h-6 w-6"
            )}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
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