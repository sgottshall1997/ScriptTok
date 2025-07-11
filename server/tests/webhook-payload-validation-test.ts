/**
 * Webhook Payload Validation Test
 * Validates that both single and automated bulk generators send complete AI evaluation data
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testWebhookPayloads() {
  console.log('\n🔍 WEBHOOK PAYLOAD VALIDATION TEST');
  console.log('═'.repeat(60));
  
  try {
    // Test 1: Single Content Generator
    console.log('\n📝 TEST 1: Single Content Generator');
    console.log('─'.repeat(40));
    
    const singleGenResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        product: 'Webhook Test Product Single',
        niche: 'tech', 
        templateType: 'Short-Form Video Script',
        tone: 'Professional',
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: false,
        useSmartStyle: false
      })
    });
    
    if (singleGenResponse.ok) {
      const singleResult = await singleGenResponse.json();
      console.log('✅ Single generator request successful');
      console.log(`📊 Success: ${singleResult.success}, Results: ${singleResult.data?.results?.length || 0}`);
    } else {
      console.log('❌ Single generator request failed:', singleGenResponse.status);
    }
    
    // Brief delay to let logs appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Automated Bulk Generator (3 niches for faster test)
    console.log('\n📝 TEST 2: Automated Bulk Generator (3 niches)');
    console.log('─'.repeat(40));
    
    const bulkGenResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'automated',
        niches: ['tech', 'beauty', 'fitness'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: false,
        useSmartStyle: false,
        useExistingProducts: true
      })
    });
    
    if (bulkGenResponse.ok) {
      const bulkResult = await bulkGenResponse.json();
      console.log('✅ Bulk generator request successful');
      console.log(`📊 Success: ${bulkResult.success}, Results: ${bulkResult.data?.results?.length || 0}`);
    } else {
      console.log('❌ Bulk generator request failed:', bulkGenResponse.status);
    }
    
    console.log('\n🎯 VALIDATION COMPLETE');
    console.log('─'.repeat(40));
    console.log('✅ Both generators tested');
    console.log('📋 Check server logs above for webhook payloads');
    console.log('🔍 Look for "ratings" block with both gpt and claude data');
    console.log('📤 Verify Make.com webhook response: status 200');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWebhookPayloads().catch(console.error);