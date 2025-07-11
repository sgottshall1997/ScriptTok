/**
 * Simple AI Model Test
 * Tests that AI model selection works correctly in the unified generator
 */

async function testAiModelSelection() {
  console.log('🔍 Testing AI Model Selection...\n');
  
  // Test Claude model
  const claudePayload = {
    mode: 'manual',
    productName: 'Test Product',
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
  
  console.log('📝 Testing Claude Model...');
  console.log(`   🤖 Sending aiModel: "${claudePayload.aiModel}"`);
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claudePayload)
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
      
      // Test ChatGPT model
      const chatgptPayload = {
        ...claudePayload,
        aiModel: 'chatgpt'
      };
      
      console.log('\n📝 Testing ChatGPT Model...');
      console.log(`   🤖 Sending aiModel: "${chatgptPayload.aiModel}"`);
      
      const chatgptResponse = await fetch('http://localhost:5000/api/generate-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatgptPayload)
      });
      
      if (!chatgptResponse.ok) {
        const errorText = await chatgptResponse.text();
        console.error('❌ ChatGPT request failed:', chatgptResponse.status, errorText);
        return;
      }
      
      const chatgptResult = await chatgptResponse.json();
      
      if (chatgptResult.success) {
        const chatgptResponseModel = chatgptResult.data.results[0]?.aiModel;
        console.log(`   ✅ Generation successful`);
        console.log(`   🤖 Response aiModel: "${chatgptResponseModel}"`);
        console.log(`   ${chatgptResponseModel === 'chatgpt' ? '✅' : '❌'} Model Match: ${chatgptResponseModel === 'chatgpt'}`);
        
        console.log('\n🎉 AI Model Selection Test Complete!');
        
        if (responseModel === 'claude' && chatgptResponseModel === 'chatgpt') {
          console.log('✅ RESULT: AI model selection is working correctly!');
        } else {
          console.log('❌ RESULT: AI model selection has issues.');
        }
      } else {
        console.error('❌ ChatGPT generation failed:', chatgptResult.error);
      }
    } else {
      console.error('❌ Claude generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAiModelSelection();