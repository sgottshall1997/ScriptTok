import { SpartanContentGenerator } from '@/components/SpartanContentGenerator';
import AboutThisPage from '@/components/AboutThisPage';

export default function SpartanContentPage() {
  return (
    <>
      <SpartanContentGenerator />
      <AboutThisPage 
        title="Spartan Content Generator"
        whatItDoes="Professional content refinement tool that transforms casual language into polished, business-ready content. Automatically removes filler words, improves tone, and ensures professional communication standards while maintaining authenticity and personal voice."
        setupRequirements={[
          "Input content that needs professional refinement",
          "Understanding of desired tone and communication style",
          "Clear objectives for content transformation"
        ]}
        usageInstructions={[
          "Paste your casual or rough content into the input field",
          "Select the desired professional tone level",
          "Choose target audience (business, academic, social media, etc.)",
          "Click 'Transform to Spartan' to refine content",
          "Review cleaned content and make any final adjustments",
          "Copy polished content for use in professional communications"
        ]}
        relatedLinks={[
          {name: "Generate Content", path: "/niche/all"},
          {name: "Claude Generator", path: "/claude-generator"},
          {name: "Content History", path: "/content-history"}
        ]}
        notes={[
          "Spartan transformation maintains your authentic voice while improving professionalism",
          "Multiple tone options allow customization for different communication contexts",
          "Automatic filler word removal creates more concise, impactful content",
          "Ideal for emails, presentations, social media, and business communications",
          "Preserves key messaging while enhancing clarity and professionalism"
        ]}
      />
    </>
  );
}