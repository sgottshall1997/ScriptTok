/**
 * Test script to validate Claude AI model and Spartan format fixes
 * Tests the specific bug reported where scheduled jobs weren't respecting model and format selections
 */

console.log('🧪 TESTING CLAUDE AI MODEL AND SPARTAN FORMAT FIXES');
console.log('====================================================');

// Test 1: Direct API call to unified generator with Claude + Spartan
console.log('\n📋 TEST 1: Direct unified generator API call');
console.log('Model: Claude | Format: Spartan | Mode: automated');

const testPayload = {
  mode: 'automated',
  selectedNiches: ['beauty'],
  tones: ['Enthusiastic'],
  templates: ['Short-Form Video Script'],
  platforms: ['tiktok', 'instagram'],
  useExistingProducts: true,
  generateAffiliateLinks: false,
  useSpartanFormat: true,
  useSmartStyle: false,
  aiModel: 'claude', // CRITICAL: Test Claude model selection
  affiliateId: 'sgottshall107-20'
};

console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));

fetch('http://localhost:5000/api/generate-unified', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-generation-source': 'manual_test'
  },
  body: JSON.stringify(testPayload)
})
.then(response => response.json())
.then(data => {
  console.log('\n✅ TEST 1 RESULTS:');
  console.log('Success:', data.success);
  
  if (data.success) {
    const results = data.data.results || [];
    console.log(`Generated ${results.length} content piece(s)`);
    
    results.forEach((result, index) => {
      console.log(`\n📝 CONTENT ${index + 1}:`);
      console.log(`Product: ${result.productName}`);
      console.log(`AI Model Used: ${result.aiModelUsed || 'NOT TRACKED'}`);
      console.log(`Spartan Format: ${result.useSpartanFormat || 'NOT TRACKED'}`);
      console.log(`Script Length: ${result.script.length} chars`);
      console.log(`Script Preview: ${result.script.substring(0, 150)}...`);
      
      // Check for Spartan characteristics
      const isSpartan = result.script.length < 300 && 
                       !result.script.includes('🔥') && 
                       !result.script.includes('✨') &&
                       !result.script.includes('amazing') &&
                       !result.script.includes('incredible');
      
      console.log(`✅ Spartan Characteristics: ${isSpartan ? 'DETECTED' : 'NOT DETECTED'}`);
    });
  } else {
    console.log('❌ Error:', data.error);
  }
})
.catch(error => {
  console.error('❌ TEST 1 FAILED:', error.message);
});

// Test 2: Scheduled job configuration validation
console.log('\n📋 TEST 2: Scheduled job configuration validation');

setTimeout(() => {
  fetch('http://localhost:5000/api/scheduled-bulk/jobs')
    .then(response => response.json())
    .then(data => {
      console.log('\n✅ TEST 2 RESULTS:');
      const jobs = data.jobs || [];
      
      const job8 = jobs.find(job => job.id === 8);
      if (job8) {
        console.log(`Job 8 AI Model: ${job8.aiModel}`);
        console.log(`Job 8 Spartan Format: ${job8.useSpartanFormat}`);
        console.log(`Job 8 Is Active: ${job8.isActive}`);
        console.log(`Job 8 Last Run: ${job8.lastRunAt}`);
        
        if (job8.aiModel === 'claude' && job8.useSpartanFormat === true) {
          console.log('✅ Job 8 configuration is CORRECT');
        } else {
          console.log('❌ Job 8 configuration has ISSUES');
        }
      } else {
        console.log('❌ Job 8 not found');
      }
    })
    .catch(error => {
      console.error('❌ TEST 2 FAILED:', error.message);
    });
}, 2000);

console.log('\n🔬 Test execution started...');
console.log('Waiting for results...');