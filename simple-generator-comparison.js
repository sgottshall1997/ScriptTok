/**
 * SIMPLE AUTOMATED VS SCHEDULED GENERATOR COMPARISON
 * Identifies the exact differences in parameter passing and output generation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function compareGeneratorPaths() {
  console.log('🔍 GENERATOR PARAMETER COMPARISON');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n1️⃣ AUTOMATED BULK GENERATOR PATH');
    console.log('   Frontend → automated-bulk-generation.ts → generateContentUnified.ts');
    console.log('   Parameter Structure:');
    console.log('     - aiModels: ["claude"] (array)');
    console.log('     - contentFormats: ["spartan"] (array)');
    console.log('     - Mode: automated');
    
    console.log('\n2️⃣ SCHEDULED GENERATOR PATH');
    console.log('   Cron → scheduled-bulk-generation.ts → generateContentUnified.ts');
    console.log('   Parameter Structure:');
    console.log('     - aiModel: "claude" (string)');
    console.log('     - useSpartanFormat: true (boolean)');
    console.log('     - Mode: automated');
    
    console.log('\n3️⃣ UNIFIED GENERATOR PROCESSING');
    console.log('   Both paths call the same generateContentUnified.ts but with different parameter formats');
    
    // Test the direct unified generator endpoint with both parameter formats
    console.log('\n🧪 TESTING UNIFIED GENERATOR WITH AUTOMATED BULK FORMAT');
    
    const automatedFormatPayload = {
      mode: 'automated',
      selectedNiches: ['beauty'],
      tones: ['Professional'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok'],
      useExistingProducts: true,
      aiModels: ['claude'], // ARRAY FORMAT
      contentFormats: ['spartan'],
      useSpartanFormat: true,
      userId: 1
    };
    
    console.log('📤 Sending automated format to unified generator...');
    
    const automatedFormatResponse = await axios.post(`${BASE_URL}/api/generate-unified`, automatedFormatPayload, {
      timeout: 30000
    });
    
    console.log('✅ Automated Format Response:');
    console.log('   Success:', automatedFormatResponse.data.success);
    console.log('   Results count:', automatedFormatResponse.data.results?.length || 0);
    
    if (automatedFormatResponse.data.results?.[0]) {
      const result = automatedFormatResponse.data.results[0];
      console.log('   First Result:');
      console.log('     AI Model Used:', result.aiModel);
      console.log('     Spartan Format:', result.useSpartanFormat);
      console.log('     Content Length:', result.generatedContent?.length || 0);
    }
    
    console.log('\n🧪 TESTING UNIFIED GENERATOR WITH SCHEDULED FORMAT');
    
    const scheduledFormatPayload = {
      mode: 'automated',
      selectedNiches: ['beauty'],
      tones: ['Professional'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok'],
      useExistingProducts: true,
      aiModel: 'claude', // STRING FORMAT
      useSpartanFormat: true,
      userId: 1,
      scheduledJobId: 999 // Mark as scheduled
    };
    
    console.log('📤 Sending scheduled format to unified generator...');
    
    const scheduledFormatResponse = await axios.post(`${BASE_URL}/api/generate-unified`, scheduledFormatPayload, {
      timeout: 30000
    });
    
    console.log('✅ Scheduled Format Response:');
    console.log('   Success:', scheduledFormatResponse.data.success);
    console.log('   Results count:', scheduledFormatResponse.data.results?.length || 0);
    
    if (scheduledFormatResponse.data.results?.[0]) {
      const result = scheduledFormatResponse.data.results[0];
      console.log('   First Result:');
      console.log('     AI Model Used:', result.aiModel);
      console.log('     Spartan Format:', result.useSpartanFormat);
      console.log('     Content Length:', result.generatedContent?.length || 0);
    }
    
    console.log('\n📊 PARAMETER STRUCTURE ANALYSIS:');
    console.log('=' .repeat(50));
    console.log('🔍 Key Differences Found:');
    console.log('   1. AI Model Parameter:');
    console.log('      - Automated: aiModels (array) → needs [0] extraction');
    console.log('      - Scheduled: aiModel (string) → direct usage');
    console.log('   2. Content Format Parameter:');
    console.log('      - Automated: contentFormats (array) → needs processing');
    console.log('      - Scheduled: useSpartanFormat (boolean) → direct usage');
    console.log('   3. Unified Generator Logic:');
    console.log('      - Must handle both parameter formats correctly');
    console.log('      - Priority logic in generateContentUnified.ts is critical');
    
  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    if (error.response?.data) {
      console.error('   Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run if executed directly
if (require.main === module) {
  compareGeneratorPaths().catch(console.error);
}

module.exports = { compareGeneratorPaths };