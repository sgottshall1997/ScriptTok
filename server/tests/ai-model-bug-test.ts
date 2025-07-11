/**
 * AI Model Selection Bug Test
 * 
 * This test focuses specifically on the AI model selection bug where
 * users select Claude but get ChatGPT responses instead.
 */

import { db } from '../db.js';
import { eq, desc } from 'drizzle-orm';
import { trendingProducts } from '@shared/schema';

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  details?: any;
}

async function testAiModelSelection() {
  console.log('🔍 Testing AI Model Selection Bug...\n');
  
  const results: TestResult[] = [];
  
  try {
    // Get a test product
    const testProduct = await db.select().from(trendingProducts).limit(1);
    
    if (testProduct.length === 0) {
      throw new Error('No test products available');
    }
    
    const product = testProduct[0];
    console.log(`🎯 Testing with product: ${product.title} (${product.niche})`);
    
    // Test 1: Single Product Generator with Claude
    console.log('\n📝 Test 1: Single Product Generator - Claude Model');
    
    const singleProductPayload = {
      mode: 'manual',
      productName: product.title,
      niche: product.niche,
      template: 'Short-Form Video Script',
      tone: 'Enthusiastic',
      platforms: ['tiktok', 'instagram'],
      contentType: 'video',
      aiModel: 'claude',
      useSpartanFormat: false,
      useSmartStyle: false,
      customHook: '',
      affiliateId: 'test123-20'
    };
    
    console.log(`   🤖 Sending aiModel: "${singleProductPayload.aiModel}"`);
    console.log(`   📊 Full payload:`, JSON.stringify(singleProductPayload, null, 2));
    
    const singleResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(singleProductPayload)
    });
    
    if (!singleResponse.ok) {
      const errorText = await singleResponse.text();
      console.error('❌ Single product test failed:', singleResponse.status, errorText);
      results.push({
        test: 'Single Product Generator - Claude',
        success: false,
        error: `HTTP ${singleResponse.status}: ${errorText}`
      });
    } else {
      const singleResult = await singleResponse.json();
      
      if (singleResult.success) {
        const responseModel = singleResult.data.results[0]?.aiModel;
        const expectedModel = 'claude';
        
        console.log(`   ✅ Generation successful`);
        console.log(`   🤖 Expected model: "${expectedModel}"`);
        console.log(`   🤖 Actual model: "${responseModel}"`);
        
        const modelMatch = responseModel === expectedModel;
        console.log(`   ${modelMatch ? '✅' : '❌'} Model Match: ${modelMatch}`);
        
        results.push({
          test: 'Single Product Generator - Claude',
          success: modelMatch,
          error: modelMatch ? undefined : `Expected "${expectedModel}" but got "${responseModel}"`,
          details: {
            expected: expectedModel,
            actual: responseModel,
            content: singleResult.data.results[0]?.script?.substring(0, 100) + '...'
          }
        });
      } else {
        console.error('❌ Single product generation failed:', singleResult.error);
        results.push({
          test: 'Single Product Generator - Claude',
          success: false,
          error: singleResult.error
        });
      }
    }
    
    // Test 2: Automated Bulk Generator with Claude
    console.log('\n📝 Test 2: Automated Bulk Generator - Claude Model');
    
    const automatedBulkPayload = {
      mode: 'automated',
      selectedNiches: [product.niche],
      tones: ['Enthusiastic'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok', 'instagram'],
      aiModels: ['claude'], // Note: This is an array in automated bulk
      useExistingProducts: true,
      generateAffiliateLinks: false,
      useSpartanFormat: false,
      useSmartStyle: false,
      affiliateId: 'test123-20',
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw'
    };
    
    console.log(`   🤖 Sending aiModels: ${JSON.stringify(automatedBulkPayload.aiModels)}`);
    console.log(`   📊 Full payload:`, JSON.stringify(automatedBulkPayload, null, 2));
    
    const automatedResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automatedBulkPayload)
    });
    
    if (!automatedResponse.ok) {
      const errorText = await automatedResponse.text();
      console.error('❌ Automated bulk test failed:', automatedResponse.status, errorText);
      results.push({
        test: 'Automated Bulk Generator - Claude',
        success: false,
        error: `HTTP ${automatedResponse.status}: ${errorText}`
      });
    } else {
      const automatedResult = await automatedResponse.json();
      
      if (automatedResult.success) {
        const responseModel = automatedResult.data.results[0]?.aiModel;
        const expectedModel = 'claude';
        
        console.log(`   ✅ Generation successful`);
        console.log(`   🤖 Expected model: "${expectedModel}"`);
        console.log(`   🤖 Actual model: "${responseModel}"`);
        
        const modelMatch = responseModel === expectedModel;
        console.log(`   ${modelMatch ? '✅' : '❌'} Model Match: ${modelMatch}`);
        
        results.push({
          test: 'Automated Bulk Generator - Claude',
          success: modelMatch,
          error: modelMatch ? undefined : `Expected "${expectedModel}" but got "${responseModel}"`,
          details: {
            expected: expectedModel,
            actual: responseModel,
            content: automatedResult.data.results[0]?.script?.substring(0, 100) + '...'
          }
        });
      } else {
        console.error('❌ Automated bulk generation failed:', automatedResult.error);
        results.push({
          test: 'Automated Bulk Generator - Claude',
          success: false,
          error: automatedResult.error
        });
      }
    }
    
    // Test 3: Test with ChatGPT to ensure it works correctly
    console.log('\n📝 Test 3: Single Product Generator - ChatGPT Model (control test)');
    
    const chatgptPayload = {
      ...singleProductPayload,
      aiModel: 'chatgpt'
    };
    
    console.log(`   🤖 Sending aiModel: "${chatgptPayload.aiModel}"`);
    
    const chatgptResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatgptPayload)
    });
    
    if (!chatgptResponse.ok) {
      const errorText = await chatgptResponse.text();
      console.error('❌ ChatGPT test failed:', chatgptResponse.status, errorText);
      results.push({
        test: 'Single Product Generator - ChatGPT',
        success: false,
        error: `HTTP ${chatgptResponse.status}: ${errorText}`
      });
    } else {
      const chatgptResult = await chatgptResponse.json();
      
      if (chatgptResult.success) {
        const responseModel = chatgptResult.data.results[0]?.aiModel;
        const expectedModel = 'chatgpt';
        
        console.log(`   ✅ Generation successful`);
        console.log(`   🤖 Expected model: "${expectedModel}"`);
        console.log(`   🤖 Actual model: "${responseModel}"`);
        
        const modelMatch = responseModel === expectedModel;
        console.log(`   ${modelMatch ? '✅' : '❌'} Model Match: ${modelMatch}`);
        
        results.push({
          test: 'Single Product Generator - ChatGPT',
          success: modelMatch,
          error: modelMatch ? undefined : `Expected "${expectedModel}" but got "${responseModel}"`,
          details: {
            expected: expectedModel,
            actual: responseModel,
            content: chatgptResult.data.results[0]?.script?.substring(0, 100) + '...'
          }
        });
      } else {
        console.error('❌ ChatGPT generation failed:', chatgptResult.error);
        results.push({
          test: 'Single Product Generator - ChatGPT',
          success: false,
          error: chatgptResult.error
        });
      }
    }
    
    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('=' + '='.repeat(50));
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details: Expected "${result.details.expected}", Got "${result.details.actual}"`);
      }
    });
    
    const passCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Overall: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
      console.log('🎉 All tests passed! AI model selection is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. AI model selection bug confirmed.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return [{
      test: 'Test Suite',
      success: false,
      error: error.message
    }];
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAiModelSelection();
}

export { testAiModelSelection };