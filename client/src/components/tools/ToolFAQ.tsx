import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolFAQProps {
  faqs: FAQItem[];
  sectionTitle?: string;
}

export function ToolFAQ({ faqs, sectionTitle = 'Frequently Asked Questions' }: ToolFAQProps) {
  return (
    <section className="py-16 bg-white" data-testid="faq-section">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900"
            data-testid="faq-title"
          >
            {sectionTitle}
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
              <AccordionTrigger 
                className="text-left font-semibold text-gray-900 hover:text-violet-600 transition-colors"
                data-testid={`faq-question-${index}`}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent 
                className="text-gray-600 leading-relaxed"
                data-testid={`faq-answer-${index}`}
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
