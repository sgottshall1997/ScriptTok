import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">About GlowBot AI</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
          <CardDescription>
            Empowering content creators with AI-driven tools
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base">
          <p>
            GlowBot AI is a cutting-edge content generation platform designed to streamline the
            creation of engaging, niche-specific content for marketers, influencers, and content
            creators across various industries.
          </p>
          <p>
            Our mission is to empower content creators with powerful AI tools that help them produce
            high-quality, trend-aware content that resonates with their audience and drives
            engagement.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>What We Do</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <ul>
              <li>Generate niche-specific content for multiple industries</li>
              <li>Leverage trend data to create relevant, timely content</li>
              <li>Offer multiple content templates for diverse use cases</li>
              <li>Provide tone customization for brand voice consistency</li>
              <li>Support affiliate marketing with integrated monetization options</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Technology</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <p>
              GlowBot AI leverages advanced natural language processing, trend analysis,
              and machine learning to deliver content that's not just automated, but
              intelligent and contextually relevant.
            </p>
            <p>
              Our multi-niche approach means we've built specialized knowledge models for
              various industries, ensuring that the content we generate is accurate,
              relevant, and valuable to your specific audience.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base">
          <p>
            GlowBot AI was born from the need to solve a common challenge faced by content
            creators: generating high-quality, specialized content at scale while staying
            current with industry trends.
          </p>
          <p>
            What began as a tool focused on the beauty and skincare niche has evolved into
            a comprehensive platform serving multiple industries including technology,
            fashion, fitness, food, travel, and pet care.
          </p>
          <p>
            We're continuously improving our AI models, expanding our template library,
            and enhancing our trend detection capabilities to provide you with the most
            powerful content generation tool possible.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Join Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base">
          <p>
            Whether you're a solo content creator, social media manager, or part of a
            marketing team, GlowBot AI is designed to amplify your content creation
            capabilities.
          </p>
          <p>
            We're excited to be part of your content journey and look forward to helping
            you create engaging, trend-aware content that resonates with your audience.
          </p>
        </CardContent>
      </Card>


    </div>
  );
};

export default AboutPage;