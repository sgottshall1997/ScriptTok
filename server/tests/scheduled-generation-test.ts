/**
 * Comprehensive test for scheduled content generation fixes
 * Tests:
 * 1. Exactly 1 content per niche (no duplicates or omissions)
 * 2. Correct AI model usage (claude vs gpt)
 * 3. Fail-safe logging and error handling
 */

import { db } from '../db';
import { scheduledBulkJobs } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const EXPECTED_NICHES = ["beauty", "fitness", "tech", "fashion", "food", "travel", "pets"];

// Test payload simulating a scheduled job
const testScheduledJob = {
  id: 999,
  name: "TEST - 7 Niches Claude Model",
  selectedNiches: EXPECTED_NICHES,
  tones: ["Enthusiastic"],
  templates: ["Short-Form Video Script"],
  platforms: ["tiktok", "instagram"],
  useExistingProducts: true,
  generateAffiliateLinks: false,
  useSpartanFormat: false,
  useSmartStyle: false,
  aiModel: "claude", // CRITICAL: Test Claude model selection
  affiliateId: "sgottshall107-20",
  webhookUrl: "https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw",
  sendToMakeWebhook: true,
  userId: 1,
  totalRuns: 0,
  timezone: "America/New_York",
  scheduleTime: "06:30"
};

async function testScheduledGeneration() {
  console.log(`\n🧪 STARTING SCHEDULED GENERATION TEST`);
  console.log(`━`.repeat(80));
  console.log(`📋 Test Configuration:`);
  console.log(`   Niches: [${EXPECTED_NICHES.join(', ')}] (${EXPECTED_NICHES.length} total)`);
  console.log(`   AI Model: ${testScheduledJob.aiModel}`);
  console.log(`   Expected Outputs: ${EXPECTED_NICHES.length} (1 per niche)`);
  console.log(`━`.repeat(80));

  try {
    // Prepare the request payload for the unified generator (same as scheduled job logic)
    const payload = {
      mode: 'automated',
      selectedNiches: testScheduledJob.selectedNiches,
      tones: testScheduledJob.tones,
      templates: testScheduledJob.templates,
      platforms: testScheduledJob.platforms,
      useExistingProducts: testScheduledJob.useExistingProducts,
      generateAffiliateLinks: testScheduledJob.generateAffiliateLinks,
      useSpartanFormat: testScheduledJob.useSpartanFormat,
      useSmartStyle: testScheduledJob.useSmartStyle,
      aiModel: testScheduledJob.aiModel, // CRITICAL: Pass AI model
      affiliateId: testScheduledJob.affiliateId,
      webhookUrl: testScheduledJob.webhookUrl,
      sendToMakeWebhook: testScheduledJob.sendToMakeWebhook,
      userId: testScheduledJob.userId,
      scheduledJobId: testScheduledJob.id,
      scheduledJobName: testScheduledJob.name
    };

    console.log(`🚀 Calling unified content generator with test payload...`);
    console.log(`🤖 AI Model in payload: "${payload.aiModel}"`);

    // Call the unified content generator
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log(`\n📊 GENERATION RESULTS:`);
    console.log(`━`.repeat(80));

    if (!result.success) {
      console.error(`❌ GENERATION FAILED: ${result.error}`);
      if (result.errors && result.errors.length > 0) {
        console.error(`   Errors: ${result.errors.join(', ')}`);
      }
      return false;
    }

    // Analyze results
    const results = result.results || [];
    console.log(`✅ Generation completed successfully`);
    console.log(`📈 Total outputs generated: ${results.length}`);
    console.log(`🎯 Expected outputs: ${EXPECTED_NICHES.length}`);

    // Check niche distribution
    const nicheDistribution = {};
    const modelUsage = {};
    const generatedNiches = [];

    for (const contentResult of results) {
      const niche = contentResult.niche;
      const model = contentResult.aiModel || contentResult.modelUsed || 'unknown';
      
      nicheDistribution[niche] = (nicheDistribution[niche] || 0) + 1;
      modelUsage[model] = (modelUsage[model] || 0) + 1;
      generatedNiches.push(niche);
    }

    console.log(`\n🎯 NICHE DISTRIBUTION ANALYSIS:`);
    console.log(`━`.repeat(50));
    let distributionPassed = true;
    
    for (const expectedNiche of EXPECTED_NICHES) {
      const count = nicheDistribution[expectedNiche] || 0;
      const status = count === 1 ? '✅' : count === 0 ? '❌ MISSING' : `❌ ${count} DUPLICATES`;
      console.log(`   ${expectedNiche}: ${count} outputs ${status}`);
      if (count !== 1) distributionPassed = false;
    }

    // Check for unexpected niches
    const unexpectedNiches = Object.keys(nicheDistribution).filter(n => !EXPECTED_NICHES.includes(n));
    if (unexpectedNiches.length > 0) {
      console.log(`❌ UNEXPECTED NICHES: [${unexpectedNiches.join(', ')}]`);
      distributionPassed = false;
    }

    console.log(`\n🤖 AI MODEL USAGE ANALYSIS:`);
    console.log(`━`.repeat(50));
    let modelPassed = true;
    
    console.log(`   Expected Model: ${testScheduledJob.aiModel}`);
    for (const [model, count] of Object.entries(modelUsage)) {
      const status = model === testScheduledJob.aiModel ? '✅' : '❌ WRONG MODEL';
      console.log(`   ${model}: ${count} outputs ${status}`);
      if (model !== testScheduledJob.aiModel) modelPassed = false;
    }

    console.log(`\n📋 FINAL TEST RESULTS:`);
    console.log(`━`.repeat(80));
    console.log(`✅ Generation Success: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`🎯 Niche Distribution: ${distributionPassed ? 'PASS' : 'FAIL'} (${distributionPassed ? 'Exactly 1 per niche' : 'Distribution errors detected'})`);
    console.log(`🤖 AI Model Usage: ${modelPassed ? 'PASS' : 'FAIL'} (${modelPassed ? 'Correct model used' : 'Wrong model detected'})`);
    console.log(`📊 Output Count: ${results.length === EXPECTED_NICHES.length ? 'PASS' : 'FAIL'} (${results.length}/${EXPECTED_NICHES.length})`);

    const overallPassed = result.success && distributionPassed && modelPassed && (results.length === EXPECTED_NICHES.length);
    console.log(`\n🎉 OVERALL TEST STATUS: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);
    console.log(`━`.repeat(80));

    return overallPassed;

  } catch (error) {
    console.error(`❌ TEST FAILED WITH ERROR:`, error);
    console.log(`━`.repeat(80));
    return false;
  }
}

// Export the test function
export { testScheduledGeneration };

// If run directly, execute the test - DISABLED IN PRODUCTION
if (process.env.NODE_ENV !== 'production' && import.meta.url === `file://${process.argv[1]}`) {
  testScheduledGeneration()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}