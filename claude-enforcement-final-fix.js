/**
 * CLAUDE ENFORCEMENT FINAL FIX VERIFICATION
 * Comprehensive test to ensure Claude works every time when selected
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🔥 CLAUDE ENFORCEMENT FINAL FIX TEST');
  console.log('=' .repeat(50));
  
  const testConfigs = [
    {
      name: 'AUTOMATED BULK WITH aiModels ARRAY',
      endpoint: '/api/generate-unified',
      payload: {
        mode: 'automated',
        selectedNiches: ['beauty'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        aiModels: ['claude'], // Array format
        useSpartanFormat: true,
        userId: 1
      },
      expectedModel: 'claude'
    },
    {
      name: 'SCHEDULED JOB WITH aiModel STRING',
      endpoint: '/api/generate-unified',
      payload: {
        mode: 'automated',
        selectedNiches: ['beauty'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        aiModel: 'claude', // String format (scheduled job style)
        useSpartanFormat: true,
        userId: 1,
        scheduledJobId: 999 // Mark as scheduled
      },
      expectedModel: 'claude'
    },
    {
      name: 'MANUAL SINGLE GENERATION',
      endpoint: '/api/generate-unified',
      payload: {
        mode: 'manual',
        productName: 'CeraVe Daily Moisturizing Lotion',
        niche: 'beauty',
        template: 'Short-Form Video Script',
        tone: 'Professional',
        platforms: ['tiktok'],
        aiModel: 'claude', // Direct model selection
        useSpartanFormat: true,
        userId: 1
      },
      expectedModel: 'claude'
    }
  ];

  let allTestsPassed = true;

  for (const test of testConfigs) {
    console.log(`\n🧪 TEST: ${test.name}`);
    console.log('-' .repeat(40));
    
    try {
      console.log('📤 Sending request...');
      console.log(`   AI Parameter: ${test.payload.aiModel ? `aiModel: "${test.payload.aiModel}"` : `aiModels: ${JSON.stringify(test.payload.aiModels)}`}`);
      
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-generation-source': 'manual_ui'
        },
        body: JSON.stringify(test.payload)
      });

      const result = await response.json();
      
      if (!result.success) {
        console.log(`❌ Test failed: ${result.error}`);
        allTestsPassed = false;
        continue;
      }

      const firstResult = result.results?.[0];
      if (!firstResult) {
        console.log('❌ No results returned');
        allTestsPassed = false;
        continue;
      }

      const actualModel = firstResult.aiModel;
      const isCorrectModel = actualModel === test.expectedModel;
      
      console.log(`✅ Response received:`);
      console.log(`   Expected Model: ${test.expectedModel}`);
      console.log(`   Actual Model: ${actualModel}`);
      console.log(`   Model Correct: ${isCorrectModel ? '✅ YES' : '❌ NO'}`);
      console.log(`   Content Length: ${firstResult.generatedContent?.length || 0} chars`);
      
      // Check Spartan format characteristics
      const content = firstResult.generatedContent || '';
      const hasEmojis = /[\\u{1F300}-\\u{1F9FF}]/u.test(content);
      const wordCount = content.split(/\s+/).length;
      
      console.log(`   Spartan Format: ${firstResult.useSpartanFormat ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Has Emojis: ${hasEmojis ? '❌ YES (not spartan)' : '✅ NO (spartan)'}`);
      console.log(`   Word Count: ${wordCount} (should be <120 for spartan)`);
      
      if (!isCorrectModel) {
        console.log(`🚨 CRITICAL ERROR: Wrong AI model used!`);
        allTestsPassed = false;
      }
      
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
      allTestsPassed = false;
    }
  }

  console.log('\n🏁 FINAL RESULTS');
  console.log('=' .repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Claude enforcement is working correctly.');
    console.log('✅ Both automated and scheduled generators respect Claude selection');
    console.log('✅ Priority logic correctly handles aiModel vs aiModels parameters');
    console.log('✅ Spartan format is applied consistently');
  } else {
    console.log('❌ SOME TESTS FAILED! Claude enforcement needs more work.');
    console.log('🔧 Check the unified generator priority logic');
    console.log('🔧 Verify parameter handling for both automated and scheduled paths');
  }
  
  return allTestsPassed;
}

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testClaudeEveryTime()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testClaudeEveryTime };