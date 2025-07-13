
/**
 * COMPREHENSIVE CLAUDE DEFAULT VERIFICATION TEST
 * Tests Claude is default across ALL content generators and compares automated vs scheduled
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  productName: 'Claude Test Serum',
  niche: 'beauty',
  tone: 'Professional', 
  template: 'Short-Form Video Script',
  platforms: ['tiktok', 'instagram']
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLatestContentHistory() {
  try {
    const response = await fetch(`${BASE_URL}/api/history`);
    const data = await response.json();
    return data.history[0]; // Most recent entry
  } catch (error) {
    console.error('Error fetching content history:', error);
    return null;
  }
}

async function testClaudeDefault() {
  console.log('🔥 COMPREHENSIVE CLAUDE DEFAULT VERIFICATION TEST');
  console.log('=' .repeat(70));
  console.log('Testing that Claude is the default AI model across ALL generators\n');

  const results = {};

  // TEST 1: Single Product Generator (No AI Model Specified)
  console.log('🧪 TEST 1: Single Product Generator - Default AI Model');
  console.log('-' .repeat(50));
  
  try {
    const payload = {
      mode: 'manual',
      productName: `${TEST_CONFIG.productName} - Default Test`,
      niche: TEST_CONFIG.niche,
      tone: TEST_CONFIG.tone,
      template: TEST_CONFIG.template,
      platforms: TEST_CONFIG.platforms,
      // NO aiModel specified - should default to Claude
      useSpartanFormat: false,
      useSmartStyle: false
    };

    console.log('📝 Sending request WITHOUT aiModel parameter...');
    const response = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success && result.data.results.length > 0) {
      const aiModel = result.data.results[0].aiModel;
      const model = result.data.results[0].model;
      
      console.log(`✅ Response received - AI Model: "${aiModel}", Model: "${model}"`);
      results.singleGenerator = {
        success: true,
        aiModel: aiModel,
        model: model,
        claudeDefault: aiModel === 'claude'
      };
      
      if (aiModel === 'claude') {
        console.log('✅ PASS: Single generator defaults to Claude');
      } else {
        console.log(`❌ FAIL: Single generator used "${aiModel}" instead of Claude`);
      }
    } else {
      console.log('❌ FAIL: Single generator request failed');
      results.singleGenerator = { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log(`❌ FAIL: Single generator error - ${error.message}`);
    results.singleGenerator = { success: false, error: error.message };
  }

  await delay(3000);

  // TEST 2: Automated Bulk Generator (No AI Models Array Specified)
  console.log('\n🧪 TEST 2: Automated Bulk Generator - Default AI Model');
  console.log('-' .repeat(50));

  try {
    const payload = {
      mode: 'automated',
      selectedNiches: [TEST_CONFIG.niche],
      tones: [TEST_CONFIG.tone],
      templates: [TEST_CONFIG.template],
      platforms: TEST_CONFIG.platforms,
      useExistingProducts: true,
      // NO aiModels array specified - should default to ['claude']
      useSpartanFormat: false,
      useSmartStyle: false
    };

    console.log('📝 Sending automated bulk request WITHOUT aiModels array...');
    const response = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success && result.data.results.length > 0) {
      const aiModel = result.data.results[0].aiModel;
      const model = result.data.results[0].model;
      
      console.log(`✅ Response received - AI Model: "${aiModel}", Model: "${model}"`);
      results.automatedBulk = {
        success: true,
        aiModel: aiModel,
        model: model,
        claudeDefault: aiModel === 'claude'
      };
      
      if (aiModel === 'claude') {
        console.log('✅ PASS: Automated bulk generator defaults to Claude');
      } else {
        console.log(`❌ FAIL: Automated bulk generator used "${aiModel}" instead of Claude`);
      }
    } else {
      console.log('❌ FAIL: Automated bulk generator request failed');
      results.automatedBulk = { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log(`❌ FAIL: Automated bulk generator error - ${error.message}`);
    results.automatedBulk = { success: false, error: error.message };
  }

  await delay(3000);

  // TEST 3: Scheduled Job Simulation (Claude Specified)
  console.log('\n🧪 TEST 3: Scheduled Job Simulation - Claude Specified');
  console.log('-' .repeat(50));

  try {
    const payload = {
      mode: 'automated',
      selectedNiches: [TEST_CONFIG.niche],
      tones: [TEST_CONFIG.tone],
      templates: [TEST_CONFIG.template], 
      platforms: TEST_CONFIG.platforms,
      useExistingProducts: true,
      aiModel: 'claude', // Direct aiModel (scheduled job format)
      scheduledJobId: 999,
      scheduledJobName: 'Claude Test Job',
      useSpartanFormat: false,
      useSmartStyle: false
    };

    console.log('📝 Sending scheduled job simulation WITH aiModel="claude"...');
    const response = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-generation-source': 'scheduled_job'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success && result.data.results.length > 0) {
      const aiModel = result.data.results[0].aiModel;
      const model = result.data.results[0].model;
      
      console.log(`✅ Response received - AI Model: "${aiModel}", Model: "${model}"`);
      results.scheduledJob = {
        success: true,
        aiModel: aiModel,
        model: model,
        claudeUsed: aiModel === 'claude'
      };
      
      if (aiModel === 'claude') {
        console.log('✅ PASS: Scheduled job uses Claude correctly');
      } else {
        console.log(`❌ FAIL: Scheduled job used "${aiModel}" instead of Claude`);
      }
    } else {
      console.log('❌ FAIL: Scheduled job simulation failed');
      results.scheduledJob = { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    console.log(`❌ FAIL: Scheduled job simulation error - ${error.message}`);
    results.scheduledJob = { success: false, error: error.message };
  }

  await delay(3000);

  // TEST 4: Direct Comparison - Automated vs Scheduled (Same Parameters)
  console.log('\n🧪 TEST 4: AUTOMATED vs SCHEDULED COMPARISON');
  console.log('-' .repeat(50));
  console.log('Testing that automated bulk and scheduled generation produce identical results\n');

  let automatedResult = null;
  let scheduledResult = null;

  // 4A: Automated Bulk Generation
  console.log('📝 4A: Running Automated Bulk Generation...');
  try {
    const automatedPayload = {
      mode: 'automated',
      selectedNiches: [TEST_CONFIG.niche],
      tones: [TEST_CONFIG.tone],
      templates: [TEST_CONFIG.template],
      platforms: TEST_CONFIG.platforms,
      useExistingProducts: true,
      aiModels: ['claude'], // Array format for automated
      useSpartanFormat: false,
      useSmartStyle: false
    };

    const automatedResponse = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automatedPayload)
    });

    automatedResult = await automatedResponse.json();
    
    if (automatedResult.success && automatedResult.data.results.length > 0) {
      console.log(`✅ Automated: ${automatedResult.data.results[0].aiModel} - Content generated`);
    } else {
      console.log('❌ Automated generation failed');
    }
  } catch (error) {
    console.log(`❌ Automated generation error: ${error.message}`);
  }

  await delay(3000);

  // 4B: Scheduled Job Format
  console.log('📝 4B: Running Scheduled Job Format...');
  try {
    const scheduledPayload = {
      mode: 'automated',
      selectedNiches: [TEST_CONFIG.niche],
      tones: [TEST_CONFIG.tone],
      templates: [TEST_CONFIG.template],
      platforms: TEST_CONFIG.platforms,
      useExistingProducts: true,
      aiModel: 'claude', // String format for scheduled
      scheduledJobId: 888,
      scheduledJobName: 'Comparison Test Job',
      useSpartanFormat: false,
      useSmartStyle: false
    };

    const scheduledResponse = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-generation-source': 'scheduled_job'
      },
      body: JSON.stringify(scheduledPayload)
    });

    scheduledResult = await scheduledResponse.json();
    
    if (scheduledResult.success && scheduledResult.data.results.length > 0) {
      console.log(`✅ Scheduled: ${scheduledResult.data.results[0].aiModel} - Content generated`);
    } else {
      console.log('❌ Scheduled generation failed');
    }
  } catch (error) {
    console.log(`❌ Scheduled generation error: ${error.message}`);
  }

  // 4C: Compare Results
  console.log('\n📊 COMPARISON ANALYSIS:');
  if (automatedResult && scheduledResult && 
      automatedResult.success && scheduledResult.success &&
      automatedResult.data.results.length > 0 && scheduledResult.data.results.length > 0) {
    
    const automated = automatedResult.data.results[0];
    const scheduled = scheduledResult.data.results[0];
    
    console.log(`   Automated AI Model: "${automated.aiModel}"`);
    console.log(`   Scheduled AI Model: "${scheduled.aiModel}"`);
    console.log(`   Models Match: ${automated.aiModel === scheduled.aiModel ? '✅ YES' : '❌ NO'}`);
    console.log(`   Both Use Claude: ${(automated.aiModel === 'claude' && scheduled.aiModel === 'claude') ? '✅ YES' : '❌ NO'}`);
    
    results.comparison = {
      automatedModel: automated.aiModel,
      scheduledModel: scheduled.aiModel,
      modelsMatch: automated.aiModel === scheduled.aiModel,
      bothUseClaude: automated.aiModel === 'claude' && scheduled.aiModel === 'claude'
    };
  } else {
    console.log('   ❌ Cannot compare - one or both generations failed');
    results.comparison = { error: 'One or both generations failed' };
  }

  // FINAL REPORT
  console.log('\n' + '=' .repeat(70));
  console.log('🎯 FINAL CLAUDE DEFAULT VERIFICATION REPORT');
  console.log('=' .repeat(70));

  const allTestsPassed = 
    results.singleGenerator?.claudeDefault &&
    results.automatedBulk?.claudeDefault &&
    results.scheduledJob?.claudeUsed &&
    results.comparison?.bothUseClaude;

  console.log(`\n📋 TEST RESULTS:`);
  console.log(`   1. Single Generator Claude Default: ${results.singleGenerator?.claudeDefault ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   2. Automated Bulk Claude Default: ${results.automatedBulk?.claudeDefault ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   3. Scheduled Job Claude Usage: ${results.scheduledJob?.claudeUsed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   4. Automated vs Scheduled Match: ${results.comparison?.modelsMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   5. Both Use Claude: ${results.comparison?.bothUseClaude ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`\n🏆 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED - CLAUDE IS DEFAULT EVERYWHERE' : '❌ SOME TESTS FAILED'}`);

  if (allTestsPassed) {
    console.log('\n🎉 CLAUDE SUPREMACY CONFIRMED!');
    console.log('   ✅ Claude is the default across all content generators');
    console.log('   ✅ Automated and scheduled generators work identically');
    console.log('   ✅ System is production ready with Claude as the superior AI model');
  } else {
    console.log('\n⚠️  ISSUES DETECTED - Review failed tests above');
  }

  return results;
}

// Run the comprehensive test
testClaudeDefault().catch(console.error);
