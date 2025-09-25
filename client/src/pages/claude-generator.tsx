import React from 'react';
import { Helmet } from 'react-helmet';
import ClaudeContentGenerator from '@/components/ClaudeContentGenerator';
import AboutThisPage from '@/components/AboutThisPage';

export default function ClaudeGeneratorPage() {
  return (
    <>
      <Helmet>
        <title>Claude AI Content Generator | GlowBot</title>
        <meta name="description" content="Generate high-quality content using Anthropic's advanced Claude AI model in GlowBot's multi-niche content engine." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Claude AI Content Generator</h1>
        <p className="text-center max-w-3xl mx-auto mb-8 text-muted-foreground">
          Leverage Anthropic's Claude AI to create engaging, high-quality content for your niche.
          Claude excels at producing nuanced, contextually-aware content with a natural tone.
        </p>
        <ClaudeContentGenerator />
        <AboutThisPage 
          title="Claude AI Content Generator"
          whatItDoes="Advanced AI content generation using Anthropic's Claude model. Produces nuanced, contextually-aware content with natural tone and superior quality. Ideal for creating engaging social media posts, captions, and marketing content across multiple niches."
          setupRequirements={[
            "Active Claude API access configured in the system",
            "Select your target niche (skincare, fitness, cooking, etc.)",
            "Choose content type and platform for optimal formatting"
          ]}
          usageInstructions={[
            "Choose your niche from the dropdown menu",
            "Select content format (Instagram post, TikTok video, blog post, etc.)",
            "Add specific product names or trending topics for personalization", 
            "Click 'Generate with Claude' and wait for AI processing",
            "Review generated content and copy the parts you need",
            "Use the regenerate option if you want different variations"
          ]}
          relatedLinks={[
            {name: "Unified Content Generator", path: "/unified-content-generation"},
            {name: "Bulk Content Generation", path: "/bulk-content-generation"},
            {name: "Template Explorer", path: "/template-explorer"}
          ]}
          notes={[
            "Claude excels at producing more nuanced and creative content compared to other AI models",
            "Processing time may be slightly longer due to Claude's advanced reasoning capabilities",
            "Best results come from specific, detailed prompts and clear niche selection"
          ]}
        />
      </main>
    </>
  );
}