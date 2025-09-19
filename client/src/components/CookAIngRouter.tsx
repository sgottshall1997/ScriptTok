import React from 'react';
import { Switch, Route, Redirect } from 'wouter';
import CookAIngLayout from '@/cookaing-marketing/layouts/CookAIngLayout';
import CookAIngAuth from '@/components/CookAIngAuth';

// CookAIng Marketing Engine pages
import CookAIngMarketingDashboard from "@/pages/cookaing-marketing/index";
import CookAIngOrganizations from "@/pages/cookaing-marketing/organizations";
import CookAIngContacts from "@/pages/cookaing-marketing/contacts";
import CookAIngCampaigns from "@/pages/cookaing-marketing/campaigns";
import CookAIngWorkflows from "@/pages/cookaing-marketing/workflows";
import CookAIngForms from "@/pages/cookaing-marketing/forms";
import CookAIngAffiliateProducts from "@/pages/cookaing-marketing/affiliate-products";
import CookAIngMarketingDocs from "@/pages/cookaing-marketing/docs";
import ContentHistory from "@/cookaing-marketing/pages/ContentHistory";
import UnifiedContentGenerator from "@/cookaing-marketing/pages/UnifiedContentGenerator";
import CookAIngAbout from "@/pages/cookaing-marketing/about";
import CookAIngIntegrationsHealth from "@/pages/cookaing-marketing/integrations-health";
import CookAIngSegments from "@/pages/cookaing-marketing/segments";
import CookAIngExperiments from "@/pages/cookaing-marketing/experiments";
import CookAIngPersonalization from "@/pages/cookaing-marketing/personalization";
import CookAIngSubmissions from "@/pages/cookaing-marketing/submissions";
import CookAIngTrends from "@/pages/cookaing-marketing/trends";
import CookAIngReports from "@/pages/cookaing-marketing/reports";
import CookAIngCosts from "@/pages/cookaing-marketing/costs";
import CookAIngAttribution from "@/pages/cookaing-marketing/attribution";
import CookAIngWebhooks from "@/pages/cookaing-marketing/webhooks";
import CookAIngEmailTest from "@/pages/cookaing-marketing/email-test";
import CookAIngDevTools from "@/pages/cookaing-marketing/devtools";
import CookAIngContent from "@/pages/cookaing-marketing/content";
import CookAIngIntelligence from "@/pages/cookaing-marketing/intelligence";
import CookAIngCampaignDetail from "@/pages/cookaing-marketing/campaign-detail";
import CookAIngSocialAutomation from "@/pages/cookaing-marketing/social-automation";

const CookAIngRouter: React.FC = () => {
  return (
    <CookAIngAuth>
      <CookAIngLayout>
        <Switch>
        {/* Default redirect to marketing dashboard */}
        <Route path="/" >
          <Redirect to="/cookaing-marketing" />
        </Route>
        
        {/* CookAIng Marketing Engine routes - all mounted under /cookaing-marketing */}
        <Route path="/cookaing-marketing" component={CookAIngMarketingDashboard} />
        <Route path="/cookaing-marketing/about" component={CookAIngAbout} />
        <Route path="/cookaing-marketing/organizations" component={CookAIngOrganizations} />
        <Route path="/cookaing-marketing/contacts" component={CookAIngContacts} />
        <Route path="/cookaing-marketing/segments" component={CookAIngSegments} />
        <Route path="/cookaing-marketing/campaigns" component={CookAIngCampaigns} />
        <Route path="/cookaing-marketing/campaigns/:id" component={CookAIngCampaignDetail} />
        <Route path="/cookaing-marketing/social-automation" component={CookAIngSocialAutomation} />
        <Route path="/cookaing-marketing/experiments" component={CookAIngExperiments} />
        <Route path="/cookaing-marketing/workflows" component={CookAIngWorkflows} />
        <Route path="/cookaing-marketing/personalization" component={CookAIngPersonalization} />
        <Route path="/cookaing-marketing/forms" component={CookAIngForms} />
        <Route path="/cookaing-marketing/submissions" component={CookAIngSubmissions} />
        <Route path="/cookaing-marketing/affiliate-products" component={CookAIngAffiliateProducts} />
        <Route path="/cookaing-marketing/trends" component={CookAIngTrends} />
        <Route path="/cookaing-marketing/reports" component={CookAIngReports} />
        <Route path="/cookaing-marketing/costs" component={CookAIngCosts} />
        <Route path="/cookaing-marketing/attribution" component={CookAIngAttribution} />
        <Route path="/cookaing-marketing/integrations-health" component={CookAIngIntegrationsHealth} />
        <Route path="/cookaing-marketing/webhooks" component={CookAIngWebhooks} />
        <Route path="/cookaing-marketing/email-test" component={CookAIngEmailTest} />
        <Route path="/cookaing-marketing/devtools" component={CookAIngDevTools} />
        <Route path="/cookaing-marketing/content" component={CookAIngContent} />
        <Route path="/cookaing-marketing/content-history" component={ContentHistory} />
        <Route path="/cookaing-marketing/content-generator" component={UnifiedContentGenerator} />
        <Route path="/cookaing-marketing/intelligence" component={CookAIngIntelligence} />
        <Route path="/cookaing-marketing/docs" component={CookAIngMarketingDocs} />
      </Switch>
    </CookAIngLayout>
    </CookAIngAuth>
  );
};

export default CookAIngRouter;