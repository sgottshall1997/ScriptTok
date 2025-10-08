import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { rotateText } from "@/lib/animations";

const valueProp = [
  "Save 10 Hours Per Week on Content Creation",
  "Generate Viral Scripts in 60 Seconds",
  "2X Your Engagement with AI-Powered Hooks",
  "Turn Trends into Revenue in Minutes",
];

export default function RotatingValueProps() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % valueProp.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-24 md:h-28 lg:h-32 flex items-center justify-center mb-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          variants={rotateText}
          initial="enter"
          animate="center"
          exit="exit"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4"
          data-testid="rotating-value-prop"
        >
          {valueProp[currentIndex]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
