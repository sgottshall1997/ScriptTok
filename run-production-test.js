import { runProductionReadyTests } from './server/tests/production-ready-test.js';

async function runTest() {
  try {
    console.log('🧪 Starting comprehensive production-ready test suite...');
    const results = await runProductionReadyTests();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PRODUCTION-READY TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 EXECUTIVE SUMMARY:`);
    console.log(`• Total Tests: ${results.totalTests}`);
    console.log(`• Passed: ${results.passedTests} ✅`);
    console.log(`• Failed: ${results.failedTests} ❌`);
    console.log(`• Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n🔍 DETAILED RESULTS:`);
    
    results.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testCase}`);
      console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Product: ${result.productUsed}`);
      console.log(`   AI Model: ${result.modelUsed.toUpperCase()}`);
      console.log(`   Format: ${result.formatUsed}`);
      console.log(`   Script Length: ${result.scriptLength} chars`);
      console.log(`   Platform Captions: ${result.platformCaptionsGenerated}`);
      console.log(`   Execution Time: ${result.executionTime}ms`);
      console.log(`   Script Preview: "${result.scriptPreview}${result.scriptPreview.length === 100 ? '...' : ''}"`);
      
      if (result.errors.length > 0) {
        console.log(`   🚨 ERRORS:`);
        result.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`   ⚠️  WARNINGS:`);
        result.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
    });
    
    if (results.recommendations.length > 0) {
      console.log(`\n🔧 RECOMMENDATIONS:`);
      results.recommendations.forEach(rec => console.log(`• ${rec}`));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST SUITE COMPLETED');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

runTest();