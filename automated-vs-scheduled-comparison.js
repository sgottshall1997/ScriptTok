/**
 * AUTOMATED VS SCHEDULED GENERATOR COMPARISON TEST
 * Comprehensive investigation of why automated and scheduled generators might produce different outputs
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function compareGenerators() {
  console.log('🔍 AUTOMATED VS SCHEDULED GENERATOR COMPARISON');
  console.log('=' .repeat(60));
  
  // Test Configuration
  const testConfig = {
    selectedNiches: ['beauty'],
    tones: ['Professional'],
    templates: ['Short-Form Video Script'],
    platforms: ['tiktok'],
    useExistingProducts: true,
    generateAffiliateLinks: false,
    useSpartanFormat: true,
    useSmartStyle: false
  };
  
  try {
    console.log('\n🤖 1. TESTING AUTOMATED BULK GENERATOR');
    console.log('-' .repeat(40));
    
    // Test Automated Bulk Generator
    const automatedPayload = {
      ...testConfig,
      aiModels: ['claude'], // Array format used by automated generator
      contentFormats: ['spartan'],
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
      userId: 1
    };
    
    console.log('📤 Automated Generator Payload:');
    console.log('   aiModels:', automatedPayload.aiModels);
    console.log('   useSpartanFormat:', automatedPayload.useSpartanFormat);
    console.log('   contentFormats:', automatedPayload.contentFormats);
    
    const automatedResponse = await axios.post(`${BASE_URL}/api/automated-bulk/start`, automatedPayload, {
      timeout: 60000
    });
    
    console.log('✅ Automated Generator Response:');
    console.log('   Success:', automatedResponse.data.success);
    console.log('   Job ID:', automatedResponse.data.jobId);
    
    if (automatedResponse.data.results) {
      console.log('   Generated Content Count:', automatedResponse.data.results.length);
      automatedResponse.data.results.forEach((result, index) => {
        console.log(`   Content ${index + 1}:`);
        console.log(`     Product: ${result.productName}`);
        console.log(`     AI Model: ${result.aiModel || result.modelUsed}`);
        console.log(`     Spartan Format: ${result.useSpartanFormat ? 'Yes' : 'No'}`);
        console.log(`     Content Length: ${result.generatedContent?.length || 0} chars`);
        
        // Check for Spartan characteristics in content
        const content = result.generatedContent || '';
        const hasEmojis = /[\\u{1F600}-\\u{1F64F}]|[\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\u{1F6FF}]|[\\u{1F1E0}-\\u{1F1FF}]/u.test(content);
        const wordCount = content.split(/\s+/).length;
        
        console.log(`     Has Emojis: ${hasEmojis ? 'Yes (❌ Not Spartan)' : 'No (✅ Spartan)'}`);
        console.log(`     Word Count: ${wordCount} (Spartan should be <120)`);
      });
    }
    
    console.log('\n🕒 2. TESTING SCHEDULED GENERATOR (via Manual Trigger)');
    console.log('-' .repeat(40));
    
    // Create a test scheduled job first
    const scheduledJobPayload = {
      name: 'Test Comparison Job - Claude Spartan',
      scheduleTime: '23:59',
      timezone: 'America/New_York',
      isActive: false, // Don't activate, just create for testing
      ...testConfig,
      ai_model: 'claude', // Single string format used by scheduled generator
      use_spartan_format: true
    };
    
    console.log('📤 Scheduled Job Creation Payload:');
    console.log('   ai_model:', scheduledJobPayload.ai_model);
    console.log('   use_spartan_format:', scheduledJobPayload.use_spartan_format);
    
    const createJobResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, scheduledJobPayload);
    
    if (!createJobResponse.data.success) {
      throw new Error(`Job creation failed: ${JSON.stringify(createJobResponse.data)}`);
    }
    
    const jobId = createJobResponse.data.job.id;
    console.log('✅ Scheduled Job Created - ID:', jobId);
    console.log('   AI Model in DB:', createJobResponse.data.job.aiModel);
    console.log('   Spartan Format in DB:', createJobResponse.data.job.useSpartanFormat);
    
    // Trigger the scheduled job manually
    console.log('\n🎯 Triggering scheduled job manually...');
    
    const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}/trigger`, {}, {
      timeout: 60000
    });
    
    console.log('✅ Scheduled Generator Response:');
    console.log('   Success:', triggerResponse.data.success);
    
    if (triggerResponse.data.result?.results) {
      console.log('   Generated Content Count:', triggerResponse.data.result.results.length);
      triggerResponse.data.result.results.forEach((result, index) => {
        console.log(`   Content ${index + 1}:`);
        console.log(`     Product: ${result.productName}`);
        console.log(`     AI Model: ${result.aiModel || result.modelUsed}`);
        console.log(`     Spartan Format: ${result.useSpartanFormat ? 'Yes' : 'No'}`);
        console.log(`     Content Length: ${result.generatedContent?.length || 0} chars`);
        
        // Check for Spartan characteristics in content
        const content = result.generatedContent || '';
        const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\\u{1F6FF}]|[\u{1F1E0}-\\u{1F1FF}]/u.test(content);
        const wordCount = content.split(/\s+/).length;
        
        console.log(`     Has Emojis: ${hasEmojis ? 'Yes (❌ Not Spartan)' : 'No (✅ Spartan)'}`);
        console.log(`     Word Count: ${wordCount} (Spartan should be <120)`);
      });
    }
    
    // Clean up - delete the test job
    console.log('\n🧹 Cleaning up test job...');
    await axios.delete(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}`);
    console.log('✅ Test job deleted');
    
    console.log('\n🏁 COMPARISON COMPLETE');
    console.log('=' .repeat(60));
    console.log('📊 ANALYSIS:');
    console.log('   - Automated Generator uses: aiModels array + contentFormats array');
    console.log('   - Scheduled Generator uses: ai_model string + use_spartan_format boolean');
    console.log('   - Both should produce identical outputs when configured the same');
    console.log('   - Check logs above for any discrepancies in AI model usage or content format');
    
  } catch (error) {
    console.error('❌ Comparison test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the comparison if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compareGenerators().catch(console.error);
}

module.exports = { compareGenerat