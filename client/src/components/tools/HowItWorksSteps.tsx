import { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
  sectionTitle?: string;
}

export function HowItWorksSteps({ steps, sectionTitle }: HowItWorksStepsProps) {
  const getGridColumns = () => {
    if (steps.length === 4) {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <section className="py-16 md:py-20 bg-gray-50" data-testid="how-it-works-section">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p 
            className="text-sm font-semibold tracking-wide uppercase text-violet-600 mb-4"
            data-testid="how-it-works-header"
          >
            HOW IT WORKS
          </p>
          {sectionTitle && (
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900"
              data-testid="how-it-works-title"
            >
              {sectionTitle}
            </h2>
          )}
        </div>

        {/* Steps Grid */}
        <div className={`grid ${getGridColumns()} gap-8`} data-testid="steps-grid">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm p-8 transition-shadow hover:shadow-md"
                data-testid={`step-card-${index}`}
              >
                {/* Numbered Circle with Icon */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4"
                    data-testid={`step-number-${index}`}
                  >
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <div 
                    className="text-violet-600"
                    data-testid={`step-icon-${index}`}
                  >
                    <IconComponent className="w-10 h-10" />
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl font-semibold text-gray-900 text-center mb-3"
                  data-testid={`step-title-${index}`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-600 text-center leading-relaxed"
                  data-testid={`step-description-${index}`}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
