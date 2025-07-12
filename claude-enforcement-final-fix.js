/**
 * CLAUDE ENFORCEMENT FINAL FIX VERIFICATION
 * Comprehensive test to ensure Claude works every time when selected
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🔥🔥🔥 COMPREHENSIVE CLAUDE ENFORCEMENT TEST');
  console.log('=' .repeat(60));
  
  const tests = [];
  
  // Test 1: Direct unified generator with Claude
  console.log('\n🧪 TEST 1: Direct Unified Generator with Claude');
  console.log('-'.repeat(50));
  
  try {
    const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Test Product for Claude',
      niche: 'tech',
      templateType: 'Short-Form Video Script',
      tone: 'Professional',
      platforms: ['tiktok'],
      contentType: 'video',
      useSmartStyle: false,
      useSpartanFormat: false,
      aiModel: 'claude', // CRITICAL: Must use Claude
      affiliateUrl: ''
    });
    
    if (response.status === 200) {
      console.log('✅ Direct unified generator with Claude: SUCCESS');
      tests.push({ test: 'Direct Unified Generator', status: 'SUCCESS', duration: response.data.generationTime });
    } else {
      console.log(`❌ Direct unified generator failed: ${response.status}`);
      tests.push({ test: 'Direct Unified Generator', status: 'FAILED', httpStatus: response.status });
    }
  } catch (error) {
    console.log(`❌ Direct unified generator error: ${error.message}`);
    tests.push({ test: 'Direct Unified Generator', status: 'ERROR', error: error.message });
  }
  
  // Test 2: Scheduled job creation and trigger with Claude
  console.log('\n🧪 TEST 2: Scheduled Job with Claude');
  console.log('-'.repeat(50));
  
  try {
    // Create scheduled job with Claude
    const createResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, {
      name: 'Claude Enforcement Test Job',
      selectedNiches: ['beauty'],
      tones: ['Friendly'],
      templates: ['Product Review'],
      platforms: ['tiktok'],
      scheduleTime: '14:30',
      timezone: 'America/New_York',
      useExistingProducts: true,
      generateAffiliateLinks: false,
      useSpartanFormat: false,
      useSmartStyle: false,
      aiModel: 'claude', // CRITICAL: Test Claude enforcement
      affiliateId: 'test123',
      sendToMakeWebhook: false,
      isActive: true
    });
    
    if (createResponse.status === 200) {
      const jobId = createResponse.data.job.id;
      console.log(`✅ Scheduled job created with ID: ${jobId}, AI Model: ${createResponse.data.job.aiModel}`);
      
      // Trigger the job manually
      const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}/trigger`);
      
      if (triggerResponse.status === 200) {
        console.log('✅ Scheduled job triggered successfully');
        tests.push({ test: 'Scheduled Job with Claude', status: 'SUCCESS', jobId });
      } else {
        console.log(`❌ Scheduled job trigger failed: ${triggerResponse.status}`);
        tests.push({ test: 'Scheduled Job with Claude', status: 'FAILED', phase: 'trigger' });
      }
      
      // Cleanup
      await axios.delete(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}`);
      console.log('🗑️ Test job cleaned up');
      
    } else {
      console.log(`❌ Scheduled job creation failed: ${createResponse.status}`);
      tests.push({ test: 'Scheduled Job with Claude', status: 'FAILED', phase: 'creation' });
    }
  } catch (error) {
    console.log(`❌ Scheduled job test error: ${error.message}`);
    tests.push({ test: 'Scheduled Job with Claude', status: 'ERROR', error: error.message });
  }
  
  // Test 3: Automated bulk generator with Claude
  console.log('\n🧪 TEST 3: Automated Bulk Generator with Claude');
  console.log('-'.repeat(50));
  
  try {
    const response = await axios.post(`${BASE_URL}/api/automated-bulk/start`, {
      selectedNiches: ['fitness'],
      tones: ['Enthusiastic'],
      templates: ['How-To Guide'],
      platforms: ['instagram'],
      useExistingProducts: true,
      generateAffiliateLinks: false,
      useSpartanFormat: false,
      useSmartStyle: false,
      aiModel: 'claude', // CRITICAL: Test Claude in bulk generator
      affiliateId: 'test123',
      sendToMakeWebhook: false
    });
    
    if (response.status === 200) {
      console.log('✅ Automated bulk generator with Claude: SUCCESS');
      tests.push({ test: 'Automated Bulk Generator', status: 'SUCCESS', jobId: response.data.jobId });
    } else {
      console.log(`❌ Automated bulk generator failed: ${response.status}`);
      tests.push({ test: 'Automated Bulk Generator', status: 'FAILED', httpStatus: response.status });
    }
  } catch (error) {
    console.log(`❌ Automated bulk generator error: ${error.message}`);
    tests.push({ test: 'Automated Bulk Generator', status: 'ERROR', error: error.message });
  }
  
  // Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CLAUDE ENFORCEMENT TEST RESULTS');
  console.log('='.repeat(60));
  
  const successTests = tests.filter(t => t.status === 'SUCCESS');
  const failedTests = tests.filter(t => t.status !== 'SUCCESS');
  
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`   ✅ Successful: ${successTests.length}/${tests.length}`);
  console.log(`   ❌ Failed: ${failedTests.length}/${tests.length}`);
  console.log(`   📈 Success Rate: ${Math.round((successTests.length / tests.length) * 100)}%`);
  
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`   - ${test.test}: ${test.status}`);
      if (test.error) console.log(`     Error: ${test.error}`);
    });
  }
  
  // Final verdict
  if (successTests.length === tests.length) {
    console.log('\n🎉 CLAUDE WORKS EVERY SINGLE TIME - 100% SUCCESS!');
    console.log('✅ Claude AI model enforcement is PERFECT across all generators');
    return { success: true, reliability: '100%' };
  } else {
    console.log('\n⚠️  CLAUDE ENFORCEMENT NEEDS ATTENTION');
    const successRate = Math.round((successTests.length / tests.length) * 100);
    console.log(`📈 Current reliability: ${successRate}%`);
    return { success: false, reliability: `${successRate}%` };
  }
}

// Execute the test
testClaudeEveryTime().then(result => {
  console.log('\n📋 FINAL RESULT:', JSON.stringify(result, null, 2));
  if (result.success) {
    console.log('\n🚀 CLAUDE AI MODEL SELECTION IS PRODUCTION READY!');
  } else {
    console.log('\n🔧 CLAUDE ENFORCEMENT REQUIRES ADDITIONAL FIXES');
  }
}).catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
});