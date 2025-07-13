/**
 * SIMPLE CLAUDE AI MODEL TEST
 * Tests that Claude is selected when aiModels array contains claude
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testClaudeSelection() {
  console.log('🔍 CLAUDE AI MODEL SELECTION TEST');
  console.log('=' .repeat(50));
  
  const testPayload = {
    mode: 'automated',
    selectedNiches: ['beauty'],
    tones: ['Professional'],
    templates: ['Short-Form Video Script'],
    platforms: ['tiktok'],
    useExistingProducts: true,
    // IMPORTANT: Only send aiModels, NOT aiModel
    aiModels: ['claude'],
    useSpartanFormat: true,
    userId: 1
  };
  
  console.log('📤 Test payload (Claude via aiModels array):');
  console.log('   aiModels:', testPayload.aiModels);
  console.log('   No aiModel field should be sent');
  
  try {
    const response = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-generation-source': 'manual_ui'
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    if (result.success && result.results?.[0]) {
      const contentResult = result.results[0];
      console.log('\n✅ Generation successful!');
      console.log(`   AI Model Used: ${contentResult.aiModel}`);
      console.log(`   Spartan Format: ${contentResult.useSpartanFormat}`);
      console.log(`   Product: ${contentResult.productName}`);
      console.log(`   Content Length: ${contentResult.generatedContent?.length} chars`);
      
      if (contentResult.aiModel === 'claude') {
        console.log('\n🎉 SUCCESS: Claude was correctly selected!');
        return true;
      } else {
        console.log(`\n❌ FAIL: Expected Claude but got ${contentResult.aiModel}`);
        return false;
      }
    } else {
      console.log('\n❌ Generation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testScheduledJobClaude() {
  console.log('\n🔍 SCHEDULED JOB CLAUDE TEST');
  console.log('=' .repeat(50));
  
  const scheduledPayload = {
    mode: 'automated',
    selectedNiches: ['beauty'],
    tones: ['Professional'],
    templates: ['Short-Form Video Script'],
    platforms: ['tiktok'],
    useExistingProducts: true,
    // IMPORTANT: Only send aiModel, NOT aiModels (scheduled job format)
    aiModel: 'claude',
    useSpartanFormat: true,
    userId: 1,
    scheduledJobId: 999
  };
  
  console.log('📤 Scheduled job payload (Claude via aiModel string):');
  console.log('   aiModel:', scheduledPayload.aiModel);
  console.log('   scheduledJobId:', scheduledPayload.scheduledJobId);
  
  try {
    const response = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-generation-source': 'scheduled_job'
      },
      body: JSON.stringify(scheduledPayload)
    });

    const result = await response.json();
    
    if (result.success && result.results?.[0]) {
      const contentResult = result.results[0];
      console.log('\n✅ Generation successful!');
      console.log(`   AI Model Used: ${contentResult.aiModel}`);
      console.log(`   Spartan Format: ${contentResult.useSpartanFormat}`);
      console.log(`   Product: ${contentResult.productName}`);
      console.log(`   Content Length: ${contentResult.generatedContent?.length} chars`);
      
      if (contentResult.aiModel === 'claude') {
        console.log('\n🎉 SUCCESS: Claude was correctly selected for scheduled job!');
        return true;
      } else {
        console.log(`\n❌ FAIL: Expected Claude but got ${contentResult.aiModel}`);
        return false;
      }
    } else {
      console.log('\n❌ Generation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function runClaudeTests() {
  console.log('🚀 STARTING CLAUDE AI MODEL TESTS');
  console.log('=' .repeat(60));
  
  const automatedTest = await testClaudeSelection();
  const scheduledTest = await testScheduledJobClaude();
  
  console.log('\n🏁 FINAL RESULTS');
  console.log('=' .repeat(60));
  console.log(`   Automated Bulk (aiModels): ${automatedTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Scheduled Job (aiModel): ${scheduledTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = automatedTest && scheduledTest;
  console.log(`\n🎯 OVERALL: ${allPassed ? '✅ CLAUDE WORKS PERFECTLY' : '❌ CLAUDE ISSUES FOUND'}`);
  
  if (allPassed) {
    console.log('\n🔥 CLAUDE IS NOW THE SUPREME AI MODEL ACROSS ALL GENERATORS! 🔥');
  }
  
  return allPassed;
}

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runClaudeTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runClaudeTests };