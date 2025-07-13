/**
 * CLAUDE ENFORCEMENT FINAL FIX VERIFICATION
 * Comprehensive test to ensure Claude works every time when selected
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🔥 CLAUDE ENFORCEMENT VERIFICATION');
  console.log('=' .repeat(60));
  
  const tests = [
    {
      name: 'Single Product Generation with Claude Default',
      payload: {
        mode: 'manual',
        productName: 'Niacinamide Serum',
        niche: 'beauty',
        tone: 'Professional',
        template: 'Short-Form Video Script',
        platforms: ['tiktok'],
        // No aiModel specified - should default to Claude
      },
      expectedModel: 'claude'
    },
    {
      name: 'Automated Bulk with Claude Array',
      payload: {
        mode: 'automated',
        selectedNiches: ['beauty'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        aiModels: ['claude'], // Claude via array
      },
      expectedModel: 'claude'
    },
    {
      name: 'Scheduled Job with Claude String',
      payload: {
        mode: 'automated',
        selectedNiches: ['beauty'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        aiModel: 'claude', // Claude via string (scheduled job format)
        scheduledJobId: 999
      },
      expectedModel: 'claude'
    },
    {
      name: 'Default Fallback Test (no AI model specified)',
      payload: {
        mode: 'automated',
        selectedNiches: ['beauty'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        // No AI model specified at all - should default to Claude
      },
      expectedModel: 'claude'
    }
  ];

  let allPassed = true;
  
  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log('-'.repeat(50));
    
    try {
      const response = await fetch(`${BASE_URL}/api/generate-unified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-generation-source': 'manual_ui'
        },
        body: JSON.stringify(test.payload)
      });

      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        allPassed = false;
        continue;
      }

      const result = await response.json();
      
      if (result.success && result.results?.[0]) {
        const actualModel = result.results[0].aiModel;
        console.log(`   Expected: ${test.expectedModel}`);
        console.log(`   Actual: ${actualModel}`);
        
        if (actualModel === test.expectedModel) {
          console.log(`   ✅ PASS: Claude correctly selected`);
        } else {
          console.log(`   ❌ FAIL: Expected ${test.expectedModel} but got ${actualModel}`);
          allPassed = false;
        }
      } else {
        console.log(`   ❌ FAIL: Generation failed - ${result.error || 'Unknown error'}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`   ❌ FAIL: Test error - ${error.message}`);
      allPassed = false;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 FINAL VERIFICATION RESULTS');
  console.log('=' .repeat(60));
  console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🔥🔥🔥 CLAUDE SUPREMACY ACHIEVED! 🔥🔥🔥');
    console.log('Claude is now the default across ALL generation paths!');
  } else {
    console.log('\n⚠️ Claude enforcement needs more work');
  }
  
  return allPassed;
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