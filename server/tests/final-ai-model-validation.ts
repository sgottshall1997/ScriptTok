/**
 * Final AI Model Validation Test
 * Validates that both single and automated bulk generation correctly use selected AI models
 */

async function testFinalAiModelValidation() {
  console.log('🔍 Final AI Model Validation Test\n');
  
  // Test 1: Single Content Generator with Claude
  console.log('Test 1: Single Content Generator with Claude');
  const singleClaudePayload = {
    mode: 'manual',
    productName: 'Claude Test Product',
    niche: 'beauty',
    template: 'Short-Form Video Script',
    tone: 'Enthusiastic',
    platforms: ['tiktok'],
    contentType: 'video',
    aiModel: 'claude',
    useSpartanFormat: false,
    useSmartStyle: false,
    affiliateId: 'test123-20'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(singleClaudePayload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      const model = result.data.results[0]?.aiModel;
      console.log(`✅ Single Generator: ${model === 'claude' ? 'PASS' : 'FAIL'} (Got: ${model})`);
    } else {
      console.log('❌ Single Generator: FAIL - Generation failed');
    }
  } catch (error) {
    console.log('❌ Single Generator: FAIL - Request failed');
  }
  
  // Test 2: Automated Bulk Generator with Claude
  console.log('\nTest 2: Automated Bulk Generator with Claude');
  const automatedClaudePayload = {
    mode: 'automated',
    selectedNiches: ['beauty'],
    tones: ['Enthusiastic'],
    templates: ['Short-Form Video Script'],
    platforms: ['tiktok'],
    aiModels: ['claude'], // Array format
    useExistingProducts: true,
    generateAffiliateLinks: false,
    useSpartanFormat: false,
    useSmartStyle: false,
    affiliateId: 'test123-20'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automatedClaudePayload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      const model = result.data.results[0]?.aiModel;
      console.log(`✅ Automated Bulk: ${model === 'claude' ? 'PASS' : 'FAIL'} (Got: ${model})`);
    } else {
      console.log('❌ Automated Bulk: FAIL - Generation failed');
    }
  } catch (error) {
    console.log('❌ Automated Bulk: FAIL - Request failed');
  }
  
  console.log('\n🎉 AI Model Validation Complete!');
}

// Run the test
testFinalAiModelValidation();