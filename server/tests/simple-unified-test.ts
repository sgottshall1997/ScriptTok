/**
 * Simple Unified Generator Test
 * Quick test to verify the unified generator API works correctly
 */

import { db } from '../db.js';
import { eq, desc } from 'drizzle-orm';
import { trendingProducts } from '@shared/schema';

async function runSimpleTest() {
  console.log('🧪 Running simple unified generator test...');
  
  try {
    // Get a test product
    const testProduct = await db.select().from(trendingProducts).limit(1);
    
    if (testProduct.length === 0) {
      throw new Error('No test products available');
    }
    
    const product = testProduct[0];
    console.log(`🎯 Testing with product: ${product.title} (${product.niche})`);
    
    // Test the unified generator API
    const testPayload = {
      mode: 'manual',
      data: {
        productName: product.title,
        niche: product.niche,
        template: 'original',
        tone: 'enthusiastic',
        platforms: ['tiktok', 'instagram'],
        contentType: 'video',
        aiModel: 'chatgpt',
        useSpartanFormat: false,
        useSmartStyle: false,
        customHook: '',
        affiliateId: 'test123-20'
      }
    };
    
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return { success: false, error: errorText };
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Generation failed:', result.error);
      return { success: false, error: result.error };
    }
    
    const generatedContent = result.data.results[0];
    
    if (!generatedContent) {
      console.error('❌ No content generated');
      return { success: false, error: 'No content generated' };
    }
    
    console.log('✅ Generation successful!');
    console.log(`📝 Script length: ${generatedContent.script?.length || 0} characters`);
    console.log(`📝 Script preview: ${generatedContent.script?.substring(0, 100)}...`);
    console.log(`🎯 Platform captions: ${Object.keys(generatedContent.platformCaptions || {}).join(', ')}`);
    
    return { 
      success: true, 
      content: generatedContent,
      scriptLength: generatedContent.script?.length || 0,
      platformCount: Object.keys(generatedContent.platformCaptions || {}).length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

export { runSimpleTest };