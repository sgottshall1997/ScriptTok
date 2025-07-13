/**
 * CLAUDE ENFORCEMENT FINAL FIX VERIFICATION
 * Comprehensive test to ensure Claude works every time when selected
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🔥🔥🔥 CLAUDE ENFORCEMENT FINAL FIX VERIFICATION 🔥🔥🔥\n');
  
  // Test 1: Direct unified generator with Claude
  console.log('📋 TEST 1: Direct Unified Generator with Claude');
  try {
    const directPayload = {
      mode: 'manual',
      productName: 'Test Product for Claude',
      niche: 'beauty',
      tone: 'Professional',
      template: 'Short-Form Video Script',
      platforms: ['tiktok'],
      aiModel: 'claude',
      useSpartanFormat: true
    };
    
    console.log('  🎯 AI Model in payload:', directPayload.aiModel);
    
    const directResponse = await axios.post(`${BASE_URL}/api/generate-unified`, directPayload, {
      timeout: 30000
    });
    
    if (directResponse.data.success) {
      const result = directResponse.data.results[0];
      console.log('  ✅ Generation successful');
      console.log('  🤖 AI Model Used:', result.aiModel);
      console.log('  📊 Spartan Format:', result.useSpartanFormat ? 'Yes' : 'No');
      
      if (result.aiModel === 'claude' || result.aiModel === 'Claude') {
        console.log('  🎉 SUCCESS: Claude was used correctly in direct call');
      } else {
        console.log('  ❌ FAILURE: Expected Claude, got:', result.aiModel);
      }
    }
  } catch (error) {
    console.log('  ❌ Direct test failed:', error.response?.data?.error || error.message);
  }
  
  // Test 2: Scheduled job execution path
  console.log('\n📋 TEST 2: Scheduled Job Execution Path');
  try {
    const scheduledPayload = {
      mode: 'automated',
      selectedNiches: ['beauty'],
      tones: ['Professional'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok'],
      useExistingProducts: true,
      aiModel: 'claude',  // This should override everything
      useSpartanFormat: true,
      scheduledJobId: 108
    };
    
    console.log('  🎯 AI Model in scheduled payload:', scheduledPayload.aiModel);
    console.log('  📊 Scheduled Job ID:', scheduledPayload.scheduledJobId);
    
    const scheduledResponse = await axios.post(`${BASE_URL}/api/generate-unified`, scheduledPayload, {
      timeout: 60000
    });
    
    if (scheduledResponse.data.success) {
      console.log('  ✅ Scheduled generation successful');
      console.log('  📊 Generated pieces:', scheduledResponse.data.results?.length || 0);
      
      scheduledResponse.data.results?.forEach((result, index) => {
        console.log(`    Piece ${index + 1}:`);
        console.log(`      Product: ${result.productName}`);
        console.log(`      AI Model: ${result.aiModel}`);
        console.log(`      Spartan: ${result.useSpartanFormat ? 'Yes' : 'No'}`);
        
        if (result.aiModel === 'claude' || result.aiModel === 'Claude') {
          console.log(`      ✅ Claude used correctly`);
        } else {
          console.log(`      ❌ ISSUE: Expected Claude, got ${result.aiModel}`);
        }
      });
    }
  } catch (error) {
    console.log('  ❌ Scheduled test failed:', error.response?.data?.error || error.message);
  }
  
  // Test 3: Manual trigger of existing scheduled job
  console.log('\n📋 TEST 3: Manual Trigger of Scheduled Job 108');
  try {
    const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/trigger/108`, {}, {
      timeout: 90000
    });
    
    if (triggerResponse.data.success) {
      console.log('  ✅ Trigger successful');
      console.log('  📊 Message:', triggerResponse.data.message);
      
      if (triggerResponse.data.result?.results) {
        triggerResponse.data.result.results.forEach((result, index) => {
          console.log(`    Triggered Piece ${index + 1}:`);
          console.log(`      Product: ${result.productName}`);
          console.log(`      AI Model: ${result.aiModel}`);
          
          if (result.aiModel === 'claude' || result.aiModel === 'Claude') {
            console.log(`      ✅ Claude enforced in triggered job`);
          } else {
            console.log(`      ❌ CRITICAL: Triggered job failed to use Claude`);
          }
        });
      }
    }
  } catch (error) {
    console.log('  ❌ Trigger test failed:', error.response?.data?.error || error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 CLAUDE ENFORCEMENT ANALYSIS');
  console.log('='.repeat(80));
  
  console.log('\n📊 Key Testing Areas:');
  console.log('1. Direct unified generator call with aiModel="claude"');
  console.log('2. Automated mode with Claude parameter');
  console.log('3. Manual trigger of existing Claude scheduled job');
  
  console.log('\n🔍 Critical Code Points to Verify:');
  console.log('1. generateContentUnified.ts line 698: selectedAiModel selection logic');
  console.log('2. executeScheduledJob() function: finalAiModel assignment');
  console.log('3. Frontend AutomatedBulkGenerator: default AI model selection');
  console.log('4. Database scheduled_bulk_jobs: ai_model field values');
  
  console.log('\n🎯 Expected Behavior:');
  console.log('- When aiModel="claude" is passed, Claude should be used 100% of the time');
  console.log('- Scheduled jobs with ai_model="claude" should always use Claude');
  console.log('- Frontend should default to Claude for new scheduled jobs');
  console.log('- No ChatGPT should be used when Claude is explicitly selected');
}

testClaudeEveryTime();