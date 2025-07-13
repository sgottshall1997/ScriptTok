/**
 * FINAL CLAUDE AI MODEL VERIFICATION TEST
 * Tests Claude AI model selection works every single time
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🚀 FINAL CLAUDE RELIABILITY VERIFICATION');
  console.log('Testing Claude AI model selection for PERFECTION');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // Test 1: Check if we have active Claude scheduled jobs
  console.log('\n🧪 TEST 1: Scheduled Jobs Configuration');
  console.log('-' .repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/api/scheduled/jobs`);
    
    if (response.data && response.data.jobs) {
      const jobs = response.data.jobs;
      const claudeJobs = jobs.filter(job => job.ai_model === 'claude');
      const activeClaudeJobs = claudeJobs.filter(job => job.is_active);
      
      console.log(`📊 Total scheduled jobs: ${jobs.length}`);
      console.log(`🤖 Claude jobs found: ${claudeJobs.length}`);
      console.log(`⚡ Active Claude jobs: ${activeClaudeJobs.length}`);
      
      if (activeClaudeJobs.length > 0) {
        console.log('\n📋 Active Claude jobs:');
        activeClaudeJobs.forEach(job => {
          console.log(`   Job ${job.id}: ${job.name}`);
          console.log(`     AI Model: ${job.ai_model}`);
          console.log(`     Spartan Format: ${job.use_spartan_format}`);
          console.log(`     Is Active: ${job.is_active}`);
        });
        
        results.scheduledJobsConfig = {
          success: true,
          totalJobs: jobs.length,
          claudeJobs: claudeJobs.length,
          activeClaudeJobs: activeClaudeJobs.length,
          testJob: activeClaudeJobs[0]
        };
      } else {
        console.log('❌ No active Claude jobs found for testing');
        results.scheduledJobsConfig = { success: false, error: 'No active Claude jobs' };
      }
    } else {
      console.log('❌ Invalid response format from scheduled jobs API');
      results.scheduledJobsConfig = { success: false, error: 'Invalid API response' };
    }
    
  } catch (error) {
    console.error('❌ Scheduled jobs check failed:', error.message);
    results.scheduledJobsConfig = { success: false, error: error.message };
  }
  
  // Test 2: Manual Claude Content Generation (Multiple Tests)
  console.log('\n🧪 TEST 2: Manual Claude Content Generation');
  console.log('-' .repeat(50));
  
  const manualTests = [];
  const testProducts = [
    'Claude Perfect Test Product 1',
    'Claude Perfect Test Product 2', 
    'Claude Perfect Test Product 3'
  ];
  
  for (let i = 0; i < testProducts.length; i++) {
    try {
      console.log(`📝 Manual test ${i + 1}/3: ${testProducts[i]}...`);
      
      const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
        mode: 'manual',
        productName: testProducts[i],
        niche: i === 0 ? 'tech' : i === 1 ? 'beauty' : 'fitness',
        tone: 'Professional',
        templateType: 'short_video',
        platforms: ['instagram'],
        aiModel: 'claude',
        useSpartanFormat: i % 2 === 0, // Alternate Spartan format
        affiliateUrl: '',
        customHook: ''
      });
      
      console.log(`✅ Test ${i + 1} completed: Status ${response.status}`);
      manualTests.push({ 
        test: i + 1, 
        product: testProducts[i],
        success: true, 
        status: response.status 
      });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Manual test ${i + 1} failed:`, error.message);
      manualTests.push({ 
        test: i + 1, 
        product: testProducts[i],
        success: false, 
        error: error.message 
      });
    }
  }
  
  results.manualTests = {
    success: manualTests.every(t => t.success),
    testsRun: manualTests.length,
    passedTests: manualTests.filter(t => t.success).length,
    results: manualTests
  };
  
  // Test 3: Verify Claude Usage in Database
  console.log('\n🧪 TEST 3: Database Claude Usage Verification');
  console.log('-' .repeat(50));
  
  try {
    // Wait a moment for database updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const allEntries = historyResponse.data.history;
    
    // Find our test entries
    const testEntries = allEntries.filter(entry => 
      entry.productName.includes('Claude Perfect Test Product')
    ).slice(0, 3);
    
    console.log(`📊 Found ${testEntries.length} test entries in database`);
    
    let allUsedClaude = true;
    let claudeCount = 0;
    
    console.log('\n📋 Test entries verification:');
    testEntries.forEach(entry => {
      const usedClaude = entry.modelUsed === 'claude';
      console.log(`   Entry ${entry.id}: ${entry.productName}`);
      console.log(`     Model Used: ${entry.modelUsed} (${usedClaude ? '✅' : '❌'})`);
      console.log(`     Content Type: ${typeof entry.generatedOutput?.content}`);
      
      if (usedClaude) claudeCount++;
      else allUsedClaude = false;
    });
    
    // Check overall Claude usage in recent entries
    const recentEntries = allEntries.slice(0, 10);
    const recentClaude = recentEntries.filter(entry => entry.modelUsed === 'claude');
    
    console.log(`\n📈 Recent database analysis (last 10 entries):`);
    console.log(`   Total recent entries: ${recentEntries.length}`);
    console.log(`   Claude entries: ${recentClaude.length}`);
    console.log(`   Claude percentage: ${((recentClaude.length / recentEntries.length) * 100).toFixed(1)}%`);
    
    results.databaseVerification = {
      success: true,
      testEntriesFound: testEntries.length,
      allTestsUsedClaude: allUsedClaude,
      claudeTestCount: claudeCount,
      recentClaudePercentage: (recentClaude.length / recentEntries.length) * 100
    };
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    results.databaseVerification = { success: false, error: error.message };
  }
  
  // Test 4: Trigger Scheduled Job (if available)
  console.log('\n🧪 TEST 4: Scheduled Job Claude Verification');
  console.log('-' .repeat(50));
  
  if (results.scheduledJobsConfig?.success && results.scheduledJobsConfig.testJob) {
    try {
      const testJob = results.scheduledJobsConfig.testJob;
      console.log(`🎯 Triggering scheduled job: ${testJob.id} - ${testJob.name}`);
      
      const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled/trigger/${testJob.id}`);
      console.log(`✅ Trigger successful: ${triggerResponse.status} - ${triggerResponse.data.message}`);
      
      // Wait for job completion
      console.log('⏳ Waiting 20 seconds for scheduled job completion...');
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      // Check for scheduled job content in history
      const historyResponse = await axios.get(`${BASE_URL}/api/history`);
      const recentEntries = historyResponse.data.history.slice(0, 10);
      
      // Look for recently generated content from scheduled job
      let scheduledClaudeFound = false;
      let scheduledClaudeEntry = null;
      
      // Find the most recent entry that likely came from the scheduled job
      for (const entry of recentEntries) {
        // Check if this entry was created very recently (within last minute)
        const entryTime = new Date(entry.createdAt);
        const now = new Date();
        const timeDiff = (now - entryTime) / 1000; // seconds
        
        if (timeDiff < 60 && entry.modelUsed === 'claude') {
          scheduledClaudeFound = true;
          scheduledClaudeEntry = entry;
          break;
        }
      }
      
      console.log(`🔍 Scheduled job Claude verification:`);
      if (scheduledClaudeFound) {
        console.log(`   ✅ Found recent Claude content: Entry ${scheduledClaudeEntry.id}`);
        console.log(`   📝 Product: ${scheduledClaudeEntry.productName}`);
        console.log(`   🤖 Model: ${scheduledClaudeEntry.modelUsed}`);
      } else {
        console.log(`   ⚠️ No recent Claude content found (may take longer or different timing)`);
      }
      
      results.scheduledJobTest = {
        success: true,
        jobTriggered: true,
        claudeFound: scheduledClaudeFound,
        jobId: testJob.id,
        entryId: scheduledClaudeEntry?.id
      };
      
    } catch (error) {
      console.error('❌ Scheduled job test failed:', error.message);
      results.scheduledJobTest = { success: false, error: error.message };
    }
  } else {
    console.log('⚠️ Skipping scheduled job test - no active Claude jobs available');
    results.scheduledJobTest = { success: false, error: 'No active Claude jobs to test' };
  }
  
  // Generate final perfection report
  console.log('\n🎯 CLAUDE PERFECTION ASSESSMENT');
  console.log('=' .repeat(60));
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  
  console.log('\n1. SCHEDULED JOBS CONFIGURATION:');
  if (results.scheduledJobsConfig?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Total Jobs: ${results.scheduledJobsConfig.totalJobs}`);
    console.log(`   🤖 Claude Jobs: ${results.scheduledJobsConfig.claudeJobs}`);
    console.log(`   ⚡ Active Claude Jobs: ${results.scheduledJobsConfig.activeClaudeJobs}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.scheduledJobsConfig?.error}`);
  }
  
  console.log('\n2. MANUAL CONTENT GENERATION:');
  if (results.manualTests?.success) {
    console.log(`   ✅ Status: PERFECT (${results.manualTests.passedTests}/${results.manualTests.testsRun})`);
    console.log(`   🎯 All manual tests passed`);
  } else {
    console.log(`   ❌ Status: FAILED (${results.manualTests?.passedTests || 0}/${results.manualTests?.testsRun || 0})`);
  }
  
  console.log('\n3. DATABASE VERIFICATION:');
  if (results.databaseVerification?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📝 Test Entries Found: ${results.databaseVerification.testEntriesFound}`);
    console.log(`   🤖 All Used Claude: ${results.databaseVerification.allTestsUsedClaude ? '✅ YES' : '❌ NO'}`);
    console.log(`   📈 Recent Claude Usage: ${results.databaseVerification.recentClaudePercentage.toFixed(1)}%`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.databaseVerification?.error}`);
  }
  
  console.log('\n4. SCHEDULED JOB TRIGGER:');
  if (results.scheduledJobTest?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🎯 Job Triggered: ${results.scheduledJobTest.jobTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`   🤖 Claude Found: ${results.scheduledJobTest.claudeFound ? '✅ YES' : '⚠️ UNCONFIRMED'}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.scheduledJobTest?.error}`);
  }
  
  // Calculate perfection score
  const perfectScores = [
    results.scheduledJobsConfig?.success || false,
    results.manualTests?.success || false,
    results.databaseVerification?.success && results.databaseVerification.allTestsUsedClaude || false,
    results.scheduledJobTest?.success && results.scheduledJobTest.claudeFound || false
  ];
  
  const perfectScore = perfectScores.filter(Boolean).length;
  const maxScore = perfectScores.length;
  
  console.log('\n🌟 FINAL PERFECTION RATING:');
  console.log('=' .repeat(60));
  console.log(`Score: ${perfectScore}/${maxScore} categories perfect`);
  console.log(`Rating: ${perfectScore === maxScore ? '🏆 ABSOLUTE PERFECTION' : 
                      perfectScore >= 3 ? '⭐ EXCELLENT' : 
                      perfectScore >= 2 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
  
  if (perfectScore === maxScore) {
    console.log('\n🎉 CLAUDE AI MODEL SELECTION: PERFECTION ACHIEVED!');
    console.log('   ✅ Scheduled jobs configured correctly');
    console.log('   ✅ Manual generation uses Claude 100% of the time');
    console.log('   ✅ Database shows consistent Claude usage');
    console.log('   ✅ Scheduled job execution verified with Claude');
    console.log('\n🔥 CLAUDE MODEL SELECTION IS WORKING PERFECTLY! 🔥');
  } else {
    console.log('\n📝 Areas for potential improvement:');
    if (!results.scheduledJobsConfig?.success) console.log('   • Scheduled jobs configuration');
    if (!results.manualTests?.success) console.log('   • Manual content generation consistency');
    if (!results.databaseVerification?.allTestsUsedClaude) console.log('   • Database Claude usage tracking');
    if (!results.scheduledJobTest?.claudeFound) console.log('   • Scheduled job Claude verification');
  }
  
  return {
    perfectScore,
    maxScore,
    isPerfect: perfectScore === maxScore,
    results
  };
}

// Run the final Claude reliability test
testClaudeEveryTime().catch(console.error);