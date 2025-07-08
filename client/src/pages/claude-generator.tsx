import React from 'react';
import { Helmet } from 'react-helmet';
import ClaudeContentGenerator from '@/components/ClaudeContentGenerator';

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
      </main>
    </>
  );
}