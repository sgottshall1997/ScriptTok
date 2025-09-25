import React from 'react';
import AboutThisPage from '@/components/AboutThisPage';
import { Helmet } from 'react-helmet';
import ExportImportSystem from '@/components/ExportImportSystem';

export default function ExportImportPage() {
  return (
    <>
      <Helmet>
        <title>Export & Import | GlowBot</title>
        <meta name="description" content="Export your content in various formats or import existing content to enhance with GlowBot's AI capabilities." />
      </Helmet>
      <main>
        <ExportImportSystem />
        
        <AboutThisPage 
          title="Export & Import System"
          whatItDoes="Comprehensive data management system for exporting your generated content in various formats (CSV, JSON, TXT) and importing existing content to enhance with GlowBot's AI capabilities. Enables content backup, migration, and batch processing workflows."
          setupRequirements={[
            "Generated content in your account for export functionality",
            "Properly formatted files for import (CSV, JSON, or TXT)",
            "Understanding of supported export formats and structures"
          ]}
          usageInstructions={[
            "Use Export tab to download your content in various formats",
            "Select specific content types, date ranges, or niches for targeted exports",
            "Use Import tab to upload existing content for AI enhancement",
            "Review import preview before confirming to ensure proper formatting",
            "Use exported data for backup, analysis, or external platform integration",
            "Import content to leverage GlowBot's AI optimization on existing materials"
          ]}
          relatedLinks={[
            {name: "Generate Content", path: "/"},
            {name: "Performance Analytics", path: "/performance-analytics"},
            {name: "API Integration Hub", path: "/api-integration-hub"}
          ]}
          notes={[
            "Export formats are optimized for popular data analysis and content management tools",
            "Import feature allows leveraging AI capabilities on pre-existing content",
            "Regular exports provide excellent backup solution for your content library",
            "Supports bulk operations for efficient content management",
            "Data integrity is maintained throughout export and import processes"
          ]}
        />
      </main>
    </>
  );
}