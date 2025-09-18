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

const CookAIngRouter: React.FC = () => {
  return (
    <CookAIngAuth>
      <CookAIngLayout>
        <Switch>
        {/* Default redirect to marketing dashboard */}
        <Route path="/" >
          <Redirect to="/cookaing/cookaing-marketing" />
        </Route>
        
        {/* CookAIng Marketing Engine routes - all mounted under /cookaing */}
        <Route path="/cookaing-marketing" component={CookAIngMarketingDashboard} />
        <Route path="/organizations" component={CookAIngOrganizations} />
        <Route path="/contacts" component={CookAIngContacts} />
        <Route path="/segments" component={CookAIngSegments} />
        <Route path="/campaigns" component={CookAIngCampaigns} />
        <Route path="/experiments" component={CookAIngExperiments} />
        <Route path="/workflows" component={CookAIngWorkflows} />
        <Route path="/personalization" component={CookAIngPersonalization} />
        <Route path="/forms" component={CookAIngForms} />
        <Route path="/submissions" component={CookAIngSubmissions} />
        <Route path="/affiliate-products" component={CookAIngAffiliateProducts} />
        <Route path="/trends" component={CookAIngTrends} />
        <Route path="/reports" component={CookAIngReports} />
        <Route path="/costs" component={CookAIngCosts} />
        <Route path="/attribution" component={CookAIngAttribution} />
        <Route path="/integrations-health" component={CookAIngIntegrationsHealth} />
        <Route path="/webhooks" component={CookAIngWebhooks} />
        <Route path="/email-test" component={CookAIngEmailTest} />
        <Route path="/devtools" component={CookAIngDevTools} />
        <Route path="/docs" component={CookAIngMarketingDocs} />
      </Switch>
    </CookAIngLayout>
    </CookAIngAuth>
  );
};

export default CookAIngRouter;