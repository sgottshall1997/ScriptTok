/**
 * Automated Bulk AI Model Test
 * Tests that the AutomatedBulkGenerator correctly passes AI model selection
 */

async function testAutomatedBulkAiModel() {
  console.log('🔍 Testing Automated Bulk AI Model Selection...\n');
  
  // Test automated bulk generation with Claude model
  const automatedBulkPayload = {
    mode: 'automated',
    selectedNiches: ['beauty'],
    tones: ['Enthusiastic'],
    templates: ['Short-Form Video Script'],
    platforms: ['tiktok'],
    aiModels: ['claude'], // Array format as sent by frontend
    useExistingProducts: true,
    generateAffiliateLinks: false,
    useSpartanFormat: false,
    useSmartStyle: false,
    affiliateId: 'test123-20',
    makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw'
  };
  
  console.log('📝 Testing Automated Bulk with Claude Model...');
  console.log(`   🤖 Sending aiModels: ${JSON.stringify(automatedBulkPayload.aiModels)}`);
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automatedBulkPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      const responseModel = result.data.results[0]?.aiModel;
      console.log(`   ✅ Generation successful`);
      console.log(`   🤖 Response aiModel: "${responseModel}"`);
      console.log(`   ${responseModel === 'claude' ? '✅' : '❌'} Model Match: ${responseModel === 'claude'}`);
      
      if (responseModel === 'claude') {
        console.log('🎉 Automated Bulk AI Model Selection Test PASSED!');
        console.log('✅ The AutomatedBulkGenerator correctly selects Claude model');
      } else {
        console.log('❌ Automated Bulk AI Model Selection Test FAILED!');
        console.log(`   Expected: claude, Got: ${responseModel}`);
      }
    } else {
      console.error('❌ Generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAutomatedBulkAiModel();