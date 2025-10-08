import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: Step[];
  className?: string;
}

export function HowItWorksSection({
  title,
  steps,
  className,
}: HowItWorksSectionProps) {
  return (
    <section className={cn("py-16 px-4", className)} data-testid="how-it-works-section">
      <div className="container mx-auto max-w-6xl">
        <h2
          className="text-3xl md:text-4xl lg:text-display-sm font-bold text-center mb-12"
          data-testid="how-it-works-title"
        >
          {title}
        </h2>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative" data-testid={`step-${index}`}>
                <Card className="rounded-2xl shadow-sm h-full">
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                        {step.number}
                      </div>
                      <h3
                        className="text-xl font-semibold mb-3"
                        data-testid={`step-title-${index}`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-muted-foreground"
                        data-testid={`step-description-${index}`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-violet-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
