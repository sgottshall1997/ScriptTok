/**
 * Claude Reliability Test - Ensures Claude works whenever called
 * Tests multiple scenarios to guarantee consistent Claude functionality
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testClaudeReliability() {
  console.log('🚀 CLAUDE RELIABILITY TEST SUITE');
  console.log('Testing Claude AI model selection across all scenarios');
  console.log('=' .repeat(70));
  
  const results = {};
  
  // Test 1: Direct Scheduled Job Trigger
  console.log('\n🧪 TEST 1: Direct Scheduled Job Trigger');
  console.log('-' .repeat(50));
  
  try {
    // Get active Claude jobs
    const jobsResponse = await axios.get(`${BASE_URL}/api/scheduled/jobs`);
    const claudeJobs = jobsResponse.data.jobs.filter(job => 
      job.ai_model === 'claude' && job.is_active
    );
    
    console.log(`📊 Found ${claudeJobs.length} active Claude jobs`);
    
    if (claudeJobs.length === 0) {
      console.log('❌ No active Claude jobs found');
      results.scheduledTrigger = { success: false, error: 'No active Claude jobs' };
    } else {
      const testJob = claudeJobs[0];
      console.log(`🎯 Testing job: ${testJob.id} - ${testJob.name}`);
      console.log(`   AI Model: ${testJob.ai_model}`);
      console.log(`   Spartan Format: ${testJob.use_spartan_format}`);
      
      // Trigger the job
      const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled/trigger/${testJob.id}`);
      console.log(`✅ Trigger response: ${triggerResponse.status} - ${triggerResponse.data.message}`);
      
      // Wait for generation
      console.log('⏳ Waiting 15 seconds for content generation...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check content history for Claude usage
      const historyResponse = await axios.get(`${BASE_URL}/api/history`);
      const recentContent = historyResponse.data.history.slice(0, 5);
      
      let claudeUsed = false;
      let spartanFormatDetected = false;
      
      for (const entry of recentContent) {
        if (entry.modelUsed === 'claude') {
          claudeUsed = true;
          console.log(`✅ Found Claude usage: Entry ${entry.id} - ${entry.productName}`);
          
          // Check for Spartan characteristics
          const content = entry.generatedOutput?.content || entry.outputText;
          if (typeof content === 'string') {
            const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
            const isShort = content.length < 300;
            
            if (!hasEmojis && isShort && testJob.use_spartan_format) {
              spartanFormatDetected = true;
              console.log(`✅ Spartan format confirmed: No emojis, length ${content.length}`);
            }
          }
          break;
        }
      }
      
      results.scheduledTrigger = {
        success: true,
        claudeUsed,
        spartanFormatDetected,
        jobId: testJob.id,
        totalContentChecked: recentContent.length
      };
    }
    
  } catch (error) {
    console.error('❌ Scheduled trigger test failed:', error.message);
    results.scheduledTrigger = { success: false, error: error.message };
  }
  
  // Test 2: Manual Unified Generator with Claude
  console.log('\n🧪 TEST 2: Manual Unified Generator with Claude');
  console.log('-' .repeat(50));
  
  try {
    console.log('📝 Generating content with Claude via unified generator...');
    
    const generateResponse = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Claude Test Product Reliability Check',
      niche: 'tech',
      tone: 'Professional',
      templateType: 'short_video',
      platforms: ['instagram'],
      aiModel: 'claude',
      useSpartanFormat: true,
      affiliateUrl: '',
      customHook: ''
    });
    
    console.log(`✅ Generation completed: ${generateResponse.status}`);
    
    // Check the generated content
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const latestEntry = historyResponse.data.history[0];
    
    console.log(`🔍 Latest entry analysis:`);
    console.log(`   ID: ${latestEntry.id}`);
    console.log(`   Product: ${latestEntry.productName}`);
    console.log(`   Model Used: ${latestEntry.modelUsed}`);
    console.log(`   Content Type: ${typeof latestEntry.generatedOutput?.content}`);
    
    const claudeUsed = latestEntry.modelUsed === 'claude';
    const isClaudeProduct = latestEntry.productName.includes('Claude Test Product');
    
    results.unifiedGenerator = {
      success: true,
      claudeUsed,
      isCorrectProduct: isClaudeProduct,
      contentId: latestEntry.id,
      modelReported: latestEntry.modelUsed
    };
    
    console.log(`✅ Claude used: ${claudeUsed}`);
    console.log(`✅ Correct product: ${isClaudeProduct}`);
    
  } catch (error) {
    console.error('❌ Unified generator test failed:', error.message);
    results.unifiedGenerator = { success: false, error: error.message };
  }
  
  // Test 3: Multiple Sequential Claude Calls
  console.log('\n🧪 TEST 3: Multiple Sequential Claude Calls');
  console.log('-' .repeat(50));
  
  const sequentialResults = [];
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`📝 Sequential test ${i}/3...`);
      
      const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
        mode: 'manual',
        productName: `Sequential Claude Test ${i}`,
        niche: 'beauty',
        tone: 'Enthusiastic',
        templateType: 'short_video',
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: false,
        affiliateUrl: '',
        customHook: ''
      });
      
      console.log(`✅ Test ${i} completed: ${response.status}`);
      
      // Brief wait between calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      sequentialResults.push({ test: i, success: true, status: response.status });
      
    } catch (error) {
      console.error(`❌ Sequential test ${i} failed:`, error.message);
      sequentialResults.push({ test: i, success: false, error: error.message });
    }
  }
  
  // Check all sequential results in content history
  const finalHistoryResponse = await axios.get(`${BASE_URL}/api/history`);
  const sequentialEntries = finalHistoryResponse.data.history.filter(entry => 
    entry.productName.includes('Sequential Claude Test')
  ).slice(0, 3);
  
  let allUsedClaude = true;
  
  console.log('\n📊 Sequential test results verification:');
  for (const entry of sequentialEntries) {
    const usedClaude = entry.modelUsed === 'claude';
    console.log(`   ${entry.productName}: Model = ${entry.modelUsed} (${usedClaude ? '✅' : '❌'})`);
    if (!usedClaude) allUsedClaude = false;
  }
  
  results.sequentialTests = {
    success: true,
    testsRun: sequentialResults.length,
    allSucceeded: sequentialResults.every(r => r.success),
    allUsedClaude,
    individualResults: sequentialResults
  };
  
  // Test 4: Database Verification
  console.log('\n🧪 TEST 4: Database Claude Usage Verification');
  console.log('-' .repeat(50));
  
  try {
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const allEntries = historyResponse.data.history;
    
    const claudeEntries = allEntries.filter(entry => entry.modelUsed === 'claude');
    const totalEntries = allEntries.length;
    
    console.log(`📊 Database analysis:`);
    console.log(`   Total entries: ${totalEntries}`);
    console.log(`   Claude entries: ${claudeEntries.length}`);
    console.log(`   Claude percentage: ${((claudeEntries.length / totalEntries) * 100).toFixed(1)}%`);
    
    // Check recent Claude entries for consistency
    const recentClaude = claudeEntries.slice(0, 5);
    console.log(`\n📋 Recent Claude entries:`);
    
    for (const entry of recentClaude) {
      const content = entry.generatedOutput?.content || entry.outputText;
      const isString = typeof content === 'string';
      const hasMetadata = isString && content.includes('"model"');
      
      console.log(`   Entry ${entry.id}: ${entry.productName}`);
      console.log(`     Model: ${entry.modelUsed}`);
      console.log(`     Content is string: ${isString}`);
      console.log(`     Content is clean: ${!hasMetadata}`);
    }
    
    results.databaseVerification = {
      success: true,
      totalEntries,
      claudeEntries: claudeEntries.length,
      claudePercentage: (claudeEntries.length / totalEntries) * 100,
      recentClaudeCount: recentClaude.length
    };
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    results.databaseVerification = { success: false, error: error.message };
  }
  
  // Generate comprehensive report
  console.log('\n📊 COMPREHENSIVE CLAUDE RELIABILITY REPORT');
  console.log('=' .repeat(70));
  
  console.log('\n1. SCHEDULED JOB TRIGGER:');
  if (results.scheduledTrigger?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🤖 Claude Used: ${results.scheduledTrigger.claudeUsed ? '✅ YES' : '❌ NO'}`);
    console.log(`   🏛️ Spartan Format: ${results.scheduledTrigger.spartanFormatDetected ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
    console.log(`   📊 Job ID: ${results.scheduledTrigger.jobId}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.scheduledTrigger?.error}`);
  }
  
  console.log('\n2. UNIFIED GENERATOR:');
  if (results.unifiedGenerator?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🤖 Claude Used: ${results.unifiedGenerator.claudeUsed ? '✅ YES' : '❌ NO'}`);
    console.log(`   📝 Correct Product: ${results.unifiedGenerator.isCorrectProduct ? '✅ YES' : '❌ NO'}`);
    console.log(`   🔍 Model Reported: ${results.unifiedGenerator.modelReported}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.unifiedGenerator?.error}`);
  }
  
  console.log('\n3. SEQUENTIAL TESTS:');
  if (results.sequentialTests?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Tests Run: ${results.sequentialTests.testsRun}/3`);
    console.log(`   ✅ All Succeeded: ${results.sequentialTests.allSucceeded ? '✅ YES' : '❌ NO'}`);
    console.log(`   🤖 All Used Claude: ${results.sequentialTests.allUsedClaude ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log(`   ❌ Status: FAILED`);
  }
  
  console.log('\n4. DATABASE VERIFICATION:');
  if (results.databaseVerification?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Total Entries: ${results.databaseVerification.totalEntries}`);
    console.log(`   🤖 Claude Entries: ${results.databaseVerification.claudeEntries}`);
    console.log(`   📈 Claude Usage: ${results.databaseVerification.claudePercentage.toFixed(1)}%`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.databaseVerification?.error}`);
  }
  
  // Overall assessment
  const allTestsPassed = Object.values(results).every(test => test.success);
  const claudeReliability = {
    scheduledJob: results.scheduledTrigger?.claudeUsed || false,
    unifiedGenerator: results.unifiedGenerator?.claudeUsed || false,
    sequentialTests: results.sequentialTests?.allUsedClaude || false
  };
  
  const reliabilityScore = Object.values(claudeReliability).filter(Boolean).length;
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log('=' .repeat(70));
  console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Claude Reliability Score: ${reliabilityScore}/3 scenarios`);
  console.log(`Claude Reliability Rating: ${reliabilityScore === 3 ? '🌟 PERFECT' : reliabilityScore === 2 ? '⚡ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
  
  if (reliabilityScore === 3) {
    console.log('\n🎉 CLAUDE MODEL SELECTION PERFECTION ACHIEVED:');
    console.log('   ✅ Scheduled jobs use Claude when configured');
    console.log('   ✅ Unified generator respects Claude selection');
    console.log('   ✅ Sequential calls maintain Claude consistency');
    console.log('   ✅ Database shows proper Claude usage tracking');
  } else {
    console.log('\n⚠️ AREAS NEEDING ATTENTION:');
    if (!claudeReliability.scheduledJob) console.log('   ❌ Scheduled jobs not using Claude');
    if (!claudeReliability.unifiedGenerator) console.log('   ❌ Unified generator not using Claude');
    if (!claudeReliability.sequentialTests) console.log('   ❌ Sequential tests inconsistent');
  }
  
  return {
    overallSuccess: allTestsPassed,
    reliabilityScore,
    results
  };
}

// Run the reliability test
testClaudeReliability().catch(console.error);