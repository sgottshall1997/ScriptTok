Please perform a comprehensive audit and update of the README.md file to accurately reflect Pheme's current implementation and state. Review the entire codebase and ensure the README is completely up-to-date with:

1. **Product Description & Branding:**
   - Verify the app name is consistently "Pheme" (not ScriptTok or other legacy names)
   - Update the tagline and description to match the current landing page messaging
   - Ensure all marketing copy aligns with LandingPage.tsx and MarketingNav.tsx

2. **Features & Capabilities:**
   - Audit all listed features against actual implementation in the codebase
   - Add any new features that exist but aren't documented (check client/src/pages/, client/src/components/)
   - Remove or mark as deprecated any features that are no longer implemented
   - Update the Dual Studios description to match current implementation
   - Verify all tools mentioned match what's in client/src/pages/tools/
   - Confirm template counts and niche categories match shared/templateMetadata.ts

3. **Pricing & Subscription Tiers:**
   - Update all pricing information to match PricingPage.tsx and LandingPage.tsx
   - Verify tier names: Free Trial (3 generations), Starter ($5-7), Creator ($10-15), Pro ($25-35), Agency (custom)
   - Confirm generation limits for each tier match the actual quotaService.ts implementation
   - Update feature access per tier to match checkFeatureAccess.ts middleware
   - Include annual vs monthly pricing differences

4. **Tech Stack & Architecture:**
   - Verify all dependencies listed match package.json
   - Update AI service integrations (OpenAI, Claude, Perplexity) with current usage patterns
   - Confirm database setup (Neon PostgreSQL, Drizzle ORM)
   - Update authentication section to reflect the dev/prod dual-environment system from authGuard.ts
   - Add Stripe billing integration details

5. **Installation & Setup:**
   - Verify all environment variables match .env.example and actual usage in the codebase
   - Update setup steps to reflect current workflow
   - Confirm all npm scripts in package.json are documented
   - Add any new configuration requirements

6. **API Endpoints:**
   - Audit all API routes in server/api/ and server/routes.ts
   - Update endpoint documentation with current request/response formats
   - Add any new endpoints that have been created
   - Remove deprecated endpoints

7. **Authentication & Authorization:**
   - Update auth documentation to reflect the dual-environment system (dev auto-login vs production Replit Auth)
   - Document quota enforcement system from checkQuota.ts
   - Explain tier-based feature access from checkFeatureAccess.ts
   - Document billing integration with Stripe

8. **File Structure:**
   - Update the project structure diagram to match current directory layout
   - Highlight key directories: client/src/pages/, server/api/, shared/, etc.
   - Document new component organization (features/, tools/, marketing/)

9. **Development & Testing:**
   - Update testing information to reflect current test suites
   - Document development scripts and workflows
   - Add deployment information specific to Replit

10. **Missing Documentation:**
    - Add sections for any major functionality that exists but isn't documented
    - Include troubleshooting section if missing
    - Add contribution guidelines if they don't exist
    - Document any webhooks (Make.com, Stripe) that are implemented

Please review every section of the README, cross-reference with the actual codebase implementation, and ensure 100% accuracy. Remove any outdated information and add any missing critical details that developers or users need to know about Pheme.