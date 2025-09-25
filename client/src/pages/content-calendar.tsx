import React from 'react';
import { Helmet } from 'react-helmet';
import ContentCalendar from '@/components/ContentCalendar';
import AboutThisPage from '@/components/AboutThisPage';

export default function ContentCalendarPage() {
  return (
    <>
      <Helmet>
        <title>Content Calendar | GlowBot</title>
        <meta name="description" content="Plan and schedule your content across multiple platforms with GlowBot's integrated content calendar." />
      </Helmet>
      <main>
        <ContentCalendar />
        <AboutThisPage 
          title="Content Calendar"
          whatItDoes="Comprehensive content planning and scheduling system. Organize your content strategy across multiple platforms with visual calendar interface, automated scheduling, and cross-platform coordination. Features drag-and-drop planning, content templates, and team collaboration tools."
          setupRequirements={[
            "Connect social media accounts for direct publishing",
            "Set up content categories and tags for organization",
            "Configure timezone and posting preferences for each platform"
          ]}
          usageInstructions={[
            "Create content items using the calendar interface",
            "Drag and drop content to schedule across different dates",
            "Assign content to specific platforms and posting times",
            "Use templates to streamline recurring content types",
            "Collaborate with team members on content planning",
            "Review calendar overview to ensure consistent posting schedule",
            "Export calendar data for external planning and analysis"
          ]}
          relatedLinks={[
            {name: "Generate Content", path: "/niche/all"},
            {name: "Content History", path: "/content-history"},
            {name: "Competitive Analysis", path: "/competitive-analysis"}
          ]}
          notes={[
            "Calendar integrates with all content generation tools for seamless workflow",
            "Visual planning helps maintain consistent posting frequency",
            "Template system accelerates content planning for recurring themes",
            "Team collaboration features enable coordinated content strategy",
            "Export functionality supports external project management tools"
          ]}
        />
      </main>
    </>
  );
}