/**
 * COMPREHENSIVE CLAUDE AI MODEL TEST
 * Tests both manual UI and scheduled bulk generation to verify Claude is being used
 */

console.log('🧪 COMPREHENSIVE CLAUDE AI MODEL TEST STARTING...\n');

// Test 1: Single Manual Generation with Claude
console.log('📋 TEST 1: Single Manual Generation with Claude');
const singlePayload = {
  mode: 'manual',
  productName: 'Test Product for Claude',
  niche: 'tech',
  templateType: 'Short-Form Video Script',
  tone: 'Professional',
  platforms: ['tiktok'],
  contentType: 'video',
  useSmartStyle: false,
  useSpartanFormat: true,
  aiModel: 'claude' // EXPLICIT Claude selection
};

fetch('http://localhost:5000/api/generate-unified', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-generation-source': 'manual_ui'
  },
  body: JSON.stringify(singlePayload)
})
.then(response => response.json())
.then(data => {
  console.log('✅ TEST 1 RESULTS:');
  if (data.success && data.data.results.length > 0) {
    const result = data.data.results[0];
    console.log(`AI Model Used: ${result.aiModel || 'UNKNOWN'}`);
    console.log(`Content Format: ${result.contentFormat || 'UNKNOWN'}`);
    console.log(`Script Length: ${result.script ? result.script.length : 'NO SCRIPT'} chars`);
    
    if (result.aiModel === 'claude') {
      console.log('✅ SINGLE GENERATION: Claude model CORRECTLY used');
    } else {
      console.log(`❌ SINGLE GENERATION: Expected Claude, got ${result.aiModel}`);
    }
  } else {
    console.log('❌ SINGLE GENERATION: Test failed - no results');
  }
})
.catch(error => {
  console.log('❌ TEST 1 FAILED:', error.message);
});

// Test 2: Check scheduled job configuration
console.log('\n📋 TEST 2: Scheduled Job Configuration Check');
setTimeout(() => {
  fetch('http://localhost:5000/api/scheduled-bulk/jobs')
    .then(response => response.json())
    .then(data => {
      console.log('✅ TEST 2 RESULTS:');
      const jobs = data.jobs || [];
      
      jobs.forEach(job => {
        console.log(`Job ${job.id}: AI Model = "${job.aiModel}", Spartan = ${job.useSpartanFormat}`);
        
        if (job.aiModel === 'claude') {
          console.log(`✅ Job ${job.id}: Claude model CORRECTLY configured`);
        } else {
          console.log(`❌ Job ${job.id}: Expected Claude, got ${job.aiModel}`);
        }
      });
    })
    .catch(error => {
      console.log('❌ TEST 2 FAILED:', error.message);
    });
}, 3000);

// Test 3: Trigger scheduled job and monitor logs
console.log('\n📋 TEST 3: Scheduled Job Execution (Check console logs)');
setTimeout(() => {
  console.log('🚀 Triggering scheduled job 8...');
  console.log('👀 WATCH CONSOLE LOGS FOR:');
  console.log('   - "🤖 Using AI Model: claude"');
  console.log('   - "🤖 Generating content with CLAUDE model"');
  console.log('   - "✅ Claude generation successful"');
  
  fetch('http://localhost:5000/api/scheduled-bulk/jobs/8/trigger', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-generation-source': 'manual_test'
    }
  })
  .then(response => {
    console.log(`✅ TEST 3: Scheduled job triggered (Status: ${response.status})`);
    console.log('🔍 Check server console logs above for Claude model usage confirmation');
  })
  .catch(error => {
    console.log('❌ TEST 3 FAILED:', error.message);
  });
}, 6000);

console.log('\n⏱️ Test execution in progress... Results will appear above.');
console.log('🔍 Monitor server console logs for detailed AI model usage information.');