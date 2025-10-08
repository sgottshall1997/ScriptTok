import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ToolHeroProps {
  eyebrowText: string;
  headline: string;
  rotatingPersonas?: string[];
  subheadline: string;
  primaryCTA: { text: string; onClick: () => void };
  secondaryCTA?: { text: string; onClick: () => void };
  reassuranceText?: string;
  demoImage?: string;
}

export function ToolHero({
  eyebrowText,
  headline,
  rotatingPersonas,
  subheadline,
  primaryCTA,
  secondaryCTA,
  reassuranceText,
  demoImage,
}: ToolHeroProps) {
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);

  useEffect(() => {
    if (!rotatingPersonas || rotatingPersonas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPersonaIndex((prev) => (prev + 1) % rotatingPersonas.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rotatingPersonas]);

  return (
    <section 
      className="relative bg-gradient-to-br from-violet-600 to-purple-600 text-white py-16 md:py-24 lg:py-32"
      data-testid="tool-hero-section"
    >
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <div className="space-y-6" data-testid="hero-content">
          {/* Eyebrow Text */}
          <p 
            className="text-sm font-semibold tracking-wide uppercase text-violet-200"
            data-testid="hero-eyebrow"
          >
            {eyebrowText}
          </p>

          {/* Headline with Optional Rotating Personas */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            data-testid="hero-headline"
          >
            {headline}
            {rotatingPersonas && rotatingPersonas.length > 0 && (
              <span className="block mt-2 min-h-[1.2em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentPersonaIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block text-violet-200"
                    data-testid={`rotating-persona-${currentPersonaIndex}`}
                  >
                    {rotatingPersonas[currentPersonaIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-violet-100 max-w-3xl mx-auto"
            data-testid="hero-subheadline"
          >
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Button
              onClick={primaryCTA.onClick}
              size="lg"
              className="bg-white text-violet-600 hover:bg-violet-50 font-semibold"
              data-testid="hero-primary-cta"
            >
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {secondaryCTA && (
              <Button
                onClick={secondaryCTA.onClick}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                data-testid="hero-secondary-cta"
              >
                {secondaryCTA.text}
              </Button>
            )}
          </div>

          {/* Reassurance Text */}
          {reassuranceText && (
            <p 
              className="text-sm text-violet-200"
              data-testid="hero-reassurance"
            >
              {reassuranceText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
