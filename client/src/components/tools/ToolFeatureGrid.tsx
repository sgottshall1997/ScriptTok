import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ToolFeatureGridProps {
  features: Feature[];
  columns?: 2 | 3;
  sectionTitle?: string;
}

export function ToolFeatureGrid({ features, columns = 3, sectionTitle }: ToolFeatureGridProps) {
  const getGridColumns = () => {
    if (columns === 2) {
      return 'grid-cols-1 md:grid-cols-2';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <section className="py-16 bg-white" data-testid="feature-grid-section">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Title */}
        {sectionTitle && (
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900"
              data-testid="feature-grid-title"
            >
              {sectionTitle}
            </h2>
          </div>
        )}

        {/* Features Grid */}
        <div className={`grid ${getGridColumns()} gap-8`} data-testid="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm p-8 transition-shadow hover:shadow-md border border-gray-100"
                data-testid={`feature-card-${index}`}
              >
                {/* Icon */}
                <div 
                  className="text-violet-600 mb-6"
                  data-testid={`feature-icon-${index}`}
                >
                  <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  data-testid={`feature-title-${index}`}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-600 leading-relaxed"
                  data-testid={`feature-description-${index}`}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
