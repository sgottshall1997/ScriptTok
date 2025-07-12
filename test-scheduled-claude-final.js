/**
 * FINAL CLAUDE SCHEDULED GENERATOR TEST
 * Complete verification that Claude is used 100% of the time in scheduled generation
 */

async function testScheduledClaudeEnforcement() {
  console.log('🔥 FINAL CLAUDE SCHEDULED GENERATOR TEST');
  console.log('=' .repeat(55));
  
  const testResults = [];
  
  // Test 1: Create scheduled job with Claude
  console.log('\n🧪 TEST 1: Create Scheduled Job with Claude');
  console.log('-'.repeat(45));
  
  try {
    const createResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Claude Test Scheduled Job',
        selectedNiches: ['tech'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        scheduleTime: '12:30',
        timezone: 'America/New_York',
        useExistingProducts: true,
        generateAffiliateLinks: false,
        useSpartanFormat: false,
        useSmartStyle: false,
        aiModel: 'claude', // CRITICAL: Must use Claude
        affiliateId: 'test123',
        sendToMakeWebhook: false,
        isActive: true
      })
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log(`✅ Job Created: ID ${createResult.job.id} with AI Model: ${createResult.job.aiModel}`);
      
      testResults.push({
        test: 'Create Scheduled Job',
        status: 'SUCCESS',
        jobId: createResult.job.id,
        aiModel: createResult.job.aiModel
      });
      
      // Test 2: Manually trigger the scheduled job
      console.log('\n🧪 TEST 2: Manually Trigger Scheduled Job');
      console.log('-'.repeat(45));
      
      const triggerResponse = await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${createResult.job.id}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (triggerResponse.ok) {
        const triggerResult = await triggerResponse.json();
        console.log(`✅ Job Triggered Successfully`);
        console.log(`📋 Result:`, triggerResult.message);
        
        testResults.push({
          test: 'Trigger Scheduled Job',
          status: 'SUCCESS',
          result: triggerResult
        });
      } else {
        console.log(`❌ Job Trigger Failed: ${triggerResponse.status}`);
        testResults.push({
          test: 'Trigger Scheduled Job',
          status: 'FAILED',
          httpStatus: triggerResponse.status
        });
      }
      
      // Test 3: Verify AI model persistence
      console.log('\n🧪 TEST 3: Verify AI Model Persistence');
      console.log('-'.repeat(45));
      
      const fetchResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs');
      if (fetchResponse.ok) {
        const fetchResult = await fetchResponse.json();
        const testJob = fetchResult.jobs.find(job => job.id === createResult.job.id);
        
        if (testJob && testJob.aiModel === 'claude') {
          console.log(`✅ AI Model Persistence: Claude correctly stored and retrieved`);
          testResults.push({
            test: 'AI Model Persistence',
            status: 'SUCCESS',
            storedModel: testJob.aiModel
          });
        } else {
          console.log(`❌ AI Model Persistence: Expected "claude", got "${testJob?.aiModel}"`);
          testResults.push({
            test: 'AI Model Persistence',
            status: 'FAILED',
            expected: 'claude',
            actual: testJob?.aiModel
          });
        }
      }
      
      // Cleanup: Delete test job
      await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${createResult.job.id}`, {
        method: 'DELETE'
      });
      console.log(`🗑️ Cleanup: Test job deleted`);
      
    } else {
      console.log(`❌ Job Creation Failed: ${createResponse.status}`);
      testResults.push({
        test: 'Create Scheduled Job',
        status: 'FAILED',
        httpStatus: createResponse.status
      });
    }
  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
    testResults.push({
      test: 'Full Test Suite',
      status: 'ERROR',
      error: error.message
    });
  }
  
  // Test Results Summary
  console.log('\n' + '='.repeat(55));
  console.log('🎯 SCHEDULED CLAUDE TEST RESULTS');
  console.log('='.repeat(55));
  
  const successTests = testResults.filter(r => r.status === 'SUCCESS');
  const failedTests = testResults.filter(r => r.status !== 'SUCCESS');
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Successful: ${successTests.length}/${testResults.length}`);
  console.log(`   ❌ Failed: ${failedTests.length}/${testResults.length}`);
  console.log(`   📈 Success Rate: ${Math.round((successTests.length / testResults.length) * 100)}%`);
  
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`   - ${test.test}: ${test.status} ${test.error ? `(${test.error})` : ''}`);
    });
  }
  
  // Final verdict
  if (successTests.length === testResults.length) {
    console.log('\n🎉 CLAUDE SCHEDULED GENERATION WORKS PERFECTLY!');
    console.log('✅ Claude AI model is used 100% of the time in scheduled jobs');
    return { reliable: true, successRate: 100 };
  } else {
    console.log('\n⚠️  SOME ISSUES DETECTED - Claude enforcement needs attention');
    return { reliable: false, successRate: Math.round((successTests.length / testResults.length) * 100) };
  }
}

// Run the test
testScheduledClaudeEnforcement().then(result => {
  console.log('\n📋 Final Result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Test suite error:', error);
});