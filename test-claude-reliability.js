/**
 * Claude Reliability Test - Ensures Claude works whenever called
 * Tests multiple scenarios to guarantee consistent Claude functionality
 */

async function testClaudeReliability() {
  console.log('🔥 CLAUDE RELIABILITY VERIFICATION TEST');
  console.log('=' .repeat(50));
  
  const testResults = [];
  
  // Test scenarios
  const scenarios = [
    {
      name: "Basic Claude Generation",
      payload: {
        mode: "manual",
        product: "Claude Test Basic",
        niche: "tech",
        templateType: "Short-Form Video Script",
        tone: "Professional",
        platforms: ["tiktok"],
        aiModel: "claude",
        useSpartanFormat: false,
        useSmartStyle: false
      }
    },
    {
      name: "Claude with Spartan Format", 
      payload: {
        mode: "manual",
        product: "Claude Test Spartan",
        niche: "beauty",
        templateType: "Short-Form Video Script",
        tone: "Casual",
        platforms: ["instagram"],
        aiModel: "claude",
        useSpartanFormat: true,
        useSmartStyle: false
      }
    },
    {
      name: "Claude Multi-Platform",
      payload: {
        mode: "manual",
        product: "Claude Test Multi",
        niche: "fitness",
        templateType: "Short-Form Video Script",
        tone: "Enthusiastic",
        platforms: ["tiktok", "instagram", "youtube", "twitter"],
        aiModel: "claude",
        useSpartanFormat: false,
        useSmartStyle: true
      }
    }
  ];
  
  // Run tests
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n🧪 TEST ${i + 1}: ${scenario.name}`);
    console.log('-'.repeat(40));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:5000/api/generate-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.payload)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ ${scenario.name}: SUCCESS (${duration}ms)`);
          console.log(`   Response received: ${result.data ? 'Valid data' : 'No data'}`);
          
          testResults.push({
            test: scenario.name,
            status: 'SUCCESS',
            duration: duration,
            hasData: !!result.data
          });
        } else {
          console.log(`❌ ${scenario.name}: FAILED - ${result.error || 'Unknown error'}`);
          testResults.push({
            test: scenario.name,
            status: 'FAILED',
            error: result.error,
            duration: duration
          });
        }
      } else {
        console.log(`❌ ${scenario.name}: HTTP ${response.status}`);
        testResults.push({
          test: scenario.name,
          status: 'HTTP_ERROR',
          httpStatus: response.status,
          duration: duration
        });
      }
    } catch (error) {
      console.log(`❌ ${scenario.name}: ERROR - ${error.message}`);
      testResults.push({
        test: scenario.name,
        status: 'ERROR',
        error: error.message
      });
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Results summary
  console.log('\n' + '='.repeat(50));
  console.log('🎯 CLAUDE RELIABILITY TEST RESULTS');
  console.log('='.repeat(50));
  
  const successTests = testResults.filter(r => r.status === 'SUCCESS');
  const failedTests = testResults.filter(r => r.status !== 'SUCCESS');
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Successful: ${successTests.length}/${testResults.length}`);
  console.log(`   ❌ Failed: ${failedTests.length}/${testResults.length}`);
  console.log(`   📈 Success Rate: ${Math.round((successTests.length / testResults.length) * 100)}%`);
  
  if (successTests.length > 0) {
    const avgDuration = successTests.reduce((sum, test) => sum + test.duration, 0) / successTests.length;
    console.log(`   ⏱️  Average Response Time: ${Math.round(avgDuration)}ms`);
  }
  
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`   - ${test.test}: ${test.status} ${test.error ? `(${test.error})` : ''}`);
    });
  }
  
  // Final verdict
  if (successTests.length === testResults.length) {
    console.log('\n🎉 CLAUDE WORKS RELIABLY - ALL TESTS PASSED!');
    return { reliable: true, successRate: 100 };
  } else if (successTests.length > 0) {
    console.log('\n⚠️  CLAUDE PARTIALLY WORKING - Some issues detected');
    return { reliable: false, successRate: Math.round((successTests.length / testResults.length) * 100) };
  } else {
    console.log('\n🚨 CLAUDE NOT WORKING - All tests failed');
    return { reliable: false, successRate: 0 };
  }
}

// Run the test
testClaudeReliability().then(result => {
  console.log('\n📋 Final Result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Test suite error:', error);
});