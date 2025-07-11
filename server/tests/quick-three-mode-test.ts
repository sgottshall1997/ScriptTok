/**
 * Quick Three-Mode Safeguard Test
 * Simple validation of three approved generation modes
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testMode(name: string, endpoint: string, headers: any, data: any, expectedStatus: number) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   Expected: ${expectedStatus === 200 ? 'ALLOWED' : 'BLOCKED'}`);
    
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      data,
      validateStatus: () => true,
      timeout: 5000 // 5 second timeout
    });
    
    const success = response.status === expectedStatus;
    console.log(`   Result: ${success ? '✅ PASS' : `❌ FAIL (got ${response.status})`}`);
    
    if (response.status === 403) {
      console.log(`   Block Reason: ${response.data?.error || 'No reason provided'}`);
    }
    
    return success;
  } catch (error) {
    console.log(`   Result: ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function runQuickTest() {
  console.log('\n🚀 Quick Three-Mode Safeguard Test');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // ✅ APPROVED MODE 1: Manual UI
  results.push(await testMode(
    'Manual UI Generation',
    '/api/generate-unified',
    { 'x-generation-source': 'manual_ui' },
    { mode: 'manual', productName: 'Test Product', niche: 'beauty' },
    200
  ));
  
  // ✅ APPROVED MODE 2: Make.com Webhook
  results.push(await testMode(
    'Make.com Webhook',
    '/api/generate-unified',
    { 'x-generation-source': 'make_com_webhook' },
    { mode: 'automated', productName: 'Test Product', niche: 'beauty' },
    200
  ));
  
  // ✅ APPROVED MODE 3: Bulk Scheduler
  results.push(await testMode(
    'Bulk Scheduler',
    '/api/generate-unified',
    { 'x-generation-source': 'bulk_scheduler' },
    { mode: 'automated', productName: 'Test Product', niche: 'beauty' },
    200
  ));
  
  // ❌ BLOCKED: Unknown Source
  results.push(await testMode(
    'Unknown Source (Should Block)',
    '/api/generate-unified',
    { 'x-generation-source': 'unknown_bot' },
    { productName: 'Test Product', niche: 'beauty' },
    403
  ));
  
  const passed = results.filter(r => r).length;
  console.log('\n📊 SUMMARY');
  console.log('=' .repeat(60));
  console.log(`🎯 Tests Passed: ${passed}/${results.length}`);
  
  if (passed === results.length) {
    console.log('🟢 ALL THREE-MODE SAFEGUARDS WORKING CORRECTLY');
    console.log('   ✅ Manual UI: Allowed');
    console.log('   ✅ Make.com Webhook: Allowed'); 
    console.log('   ✅ Bulk Scheduler: Allowed');
    console.log('   ✅ Unknown Sources: Properly Blocked');
  } else {
    console.log('🔴 SOME TESTS FAILED - REVIEW CONFIGURATION');
  }
}

// Auto-run in development
if (process.env.NODE_ENV !== 'production' && import.meta.url === `file://${process.argv[1]}`) {
  runQuickTest().catch(console.error);
}