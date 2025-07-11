/**
 * Three-Mode Safeguard Test
 * Validates exactly three approved generation modes: manual UI, Make.com webhooks, and approved automation scripts
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  name: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus?: number;
  success: boolean;
  message: string;
  source: string;
}

export async function runThreeModeSafeguardTest(): Promise<void> {
  console.log('\n🧪 Testing Three-Mode Generation Safeguard System...');
  console.log('=' .repeat(80));
  
  const testCases = [
    // ✅ APPROVED MODE 1: Manual UI Generation
    {
      name: 'Manual UI - Unified Generator',
      endpoint: '/api/generate-unified',
      method: 'POST' as const,
      headers: {
        'x-generation-source': 'manual_ui',
        'user-agent': 'Mozilla/5.0 (Chrome Browser)'
      },
      data: {
        mode: 'manual',
        productName: 'Test Product',
        niche: 'beauty',
        tone: 'Friendly',
        template: 'Product Review'
      },
      expectedStatus: 200,
      source: 'Manual UI'
    },
    
    // ✅ APPROVED MODE 2: Make.com Webhook Source
    {
      name: 'Make.com Webhook - Automated Generation',
      endpoint: '/api/automated-bulk/start',
      method: 'POST' as const,
      headers: {
        'x-generation-source': 'make_com_webhook',
        'user-agent': 'Make-webhook/1.0'
      },
      data: {
        selectedNiches: ['beauty'],
        tones: ['Friendly'],
        templates: ['Product Review'],
        platforms: ['tiktok'],
        aiModels: ['chatgpt'],
        contentFormats: ['regular']
      },
      expectedStatus: 200,
      source: 'Make.com Webhook'
    },
    
    // ✅ APPROVED MODE 3: Automation Scripts
    {
      name: 'Approved Automation Script - Bulk Scheduler',
      endpoint: '/api/bulk/start-generation',
      method: 'POST' as const,
      headers: {
        'x-generation-source': 'bulk_scheduler',
        'user-agent': 'bulk-scheduler-script'
      },
      data: {
        productName: 'Test Product',
        niche: 'beauty',
        tones: ['Friendly'],
        templates: ['Product Review'],
        platforms: ['tiktok']
      },
      expectedStatus: 200,
      source: 'Bulk Scheduler'
    },
    
    // ❌ BLOCKED: Unknown Automated Source
    {
      name: 'Unknown Automation - Should Block',
      endpoint: '/api/generate-unified',
      method: 'POST' as const,
      headers: {
        'x-generation-source': 'unknown_bot',
        'user-agent': 'curl/7.64.1'
      },
      data: {
        productName: 'Test Product',
        niche: 'beauty'
      },
      expectedStatus: 403,
      source: 'Unknown Automation'
    },
    
    // ❌ BLOCKED: No Source Header
    {
      name: 'No Source Header - Should Block',
      endpoint: '/api/automated-bulk/start',
      method: 'POST' as const,
      headers: {
        'user-agent': 'curl/7.64.1'
      },
      data: {
        selectedNiches: ['beauty'],
        tones: ['Friendly'],
        templates: ['Product Review'],
        platforms: ['tiktok'],
        aiModels: ['chatgpt'],
        contentFormats: ['regular']
      },
      expectedStatus: 403,
      source: 'No Source'
    }
  ];

  const results: TestResult[] = [];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      console.log(`   Endpoint: ${testCase.endpoint}`);
      console.log(`   Source: ${testCase.source}`);
      console.log(`   Expected: ${testCase.expectedStatus === 200 ? 'ALLOWED' : 'BLOCKED'}`);
      
      const response = await axios({
        method: testCase.method,
        url: `${BASE_URL}${testCase.endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...testCase.headers
        },
        data: testCase.data,
        validateStatus: () => true // Don't throw on non-2xx status
      });
      
      const success = response.status === testCase.expectedStatus;
      const actualStatus = response.status;
      
      results.push({
        name: testCase.name,
        endpoint: testCase.endpoint,
        expectedStatus: testCase.expectedStatus,
        actualStatus,
        success,
        message: success ? '✅ PASS' : `❌ FAIL (got ${actualStatus})`,
        source: testCase.source
      });
      
      console.log(`   Result: ${success ? '✅ PASS' : `❌ FAIL (got ${actualStatus})`}`);
      
      if (response.status === 403) {
        console.log(`   Block Reason: ${response.data?.reason || 'No reason provided'}`);
      }
      
    } catch (error) {
      console.log(`   Result: ❌ ERROR - ${error.message}`);
      results.push({
        name: testCase.name,
        endpoint: testCase.endpoint,
        expectedStatus: testCase.expectedStatus,
        success: false,
        message: `❌ ERROR - ${error.message}`,
        source: testCase.source
      });
    }
  }
  
  // Summary
  console.log('\n📊 THREE-MODE SAFEGUARD TEST SUMMARY');
  console.log('=' .repeat(80));
  
  const approvedTests = results.filter(r => r.source.includes('Manual UI') || r.source.includes('Make.com') || r.source.includes('Bulk Scheduler'));
  const blockedTests = results.filter(r => r.source.includes('Unknown') || r.source.includes('No Source'));
  
  const approvedPassed = approvedTests.filter(r => r.success).length;
  const blockedPassed = blockedTests.filter(r => r.success).length;
  
  console.log(`✅ APPROVED SOURCES: ${approvedPassed}/${approvedTests.length} passed`);
  approvedTests.forEach(test => {
    console.log(`   ${test.success ? '✅' : '❌'} ${test.name}: ${test.message}`);
  });
  
  console.log(`\n🚫 BLOCKED SOURCES: ${blockedPassed}/${blockedTests.length} passed`);
  blockedTests.forEach(test => {
    console.log(`   ${test.success ? '✅' : '❌'} ${test.name}: ${test.message}`);
  });
  
  const allPassed = results.every(r => r.success);
  const totalPassed = results.filter(r => r.success).length;
  
  console.log(`\n🎯 OVERALL RESULT: ${totalPassed}/${results.length} tests passed`);
  
  if (allPassed) {
    console.log('🟢 THREE-MODE SAFEGUARDS WORKING CORRECTLY');
    console.log('   ✅ Manual UI generation allowed');
    console.log('   ✅ Make.com webhooks allowed'); 
    console.log('   ✅ Approved automation scripts allowed');
    console.log('   ✅ Unknown sources properly blocked');
  } else {
    console.log('🔴 SAFEGUARD ISSUES DETECTED');
    console.log('   Some tests failed - review configuration');
  }
  
  console.log('=' .repeat(80));
}

// Auto-run test in development mode only
if (process.env.NODE_ENV !== 'production' && import.meta.url === `file://${process.argv[1]}`) {
  runThreeModeSafeguardTest().catch(console.error);
}