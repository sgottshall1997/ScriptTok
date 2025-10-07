import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButton {
  text: string;
  onClick: () => void;
}

interface FeatureHeroProps {
  title: string;
  subtitle: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  className?: string;
}

export function FeatureHero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  className,
}: FeatureHeroProps) {
  return (
    <section
      className={cn(
        "w-full bg-gradient-hero text-white py-16 md:py-24 px-4",
        className
      )}
      data-testid="feature-hero"
    >
      <div className="container mx-auto max-w-6xl text-center">
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          data-testid="hero-title"
        >
          {title}
        </h1>
        <p
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto"
          data-testid="hero-subtitle"
        >
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={primaryCTA.onClick}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="hero-primary-cta"
          >
            {primaryCTA.text}
          </Button>
          {secondaryCTA && (
            <Button
              onClick={secondaryCTA.onClick}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 hover:text-white rounded-xl bg-transparent"
              data-testid="hero-secondary-cta"
            >
              {secondaryCTA.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
