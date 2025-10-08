import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ToolCTAProps {
  headline: string;
  description?: string;
  primaryCTA: { text: string; onClick: () => void };
  secondaryCTA?: { text: string; onClick: () => void };
  gradient?: boolean;
}

export function ToolCTA({
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  gradient = false,
}: ToolCTAProps) {
  const bgClass = gradient
    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
    : 'bg-gray-50 text-gray-900';

  const descriptionColor = gradient ? 'text-violet-100' : 'text-gray-600';
  const primaryButtonClass = gradient
    ? 'bg-white text-violet-600 hover:bg-violet-50'
    : 'bg-violet-600 text-white hover:bg-violet-700';
  const secondaryButtonClass = gradient
    ? 'border-2 border-white text-white hover:bg-white/10'
    : 'border-2 border-violet-600 text-violet-600 hover:bg-violet-50';

  return (
    <section 
      className={`py-16 ${bgClass}`}
      data-testid="tool-cta-section"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-6">
          {/* Headline */}
          <h2 
            className="text-3xl md:text-4xl font-bold"
            data-testid="cta-headline"
          >
            {headline}
          </h2>

          {/* Description */}
          {description && (
            <p 
              className={`text-lg ${descriptionColor} max-w-2xl mx-auto`}
              data-testid="cta-description"
            >
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={primaryCTA.onClick}
              size="lg"
              className={primaryButtonClass}
              data-testid="cta-primary-button"
            >
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {secondaryCTA && (
              <Button
                onClick={secondaryCTA.onClick}
                size="lg"
                variant="outline"
                className={secondaryButtonClass}
                data-testid="cta-secondary-button"
              >
                {secondaryCTA.text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
