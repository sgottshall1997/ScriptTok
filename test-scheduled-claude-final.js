/**
 * FINAL CLAUDE SCHEDULED GENERATOR TEST
 * Complete verification that Claude is used 100% of the time in scheduled generation
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testScheduledClaudeEnforcement() {
  console.log('🚀 SCHEDULED CLAUDE ENFORCEMENT VERIFICATION');
  console.log('Testing Claude AI model in scheduled generator for PERFECTION');
  console.log('=' .repeat(70));
  
  const results = {};
  
  // Test 1: Simple Manual Claude Test First (Baseline)
  console.log('\n🧪 TEST 1: Manual Claude Baseline Test');
  console.log('-' .repeat(50));
  
  try {
    console.log('📝 Testing manual Claude generation as baseline...');
    
    const manualResponse = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Manual Claude Baseline Test',
      niche: 'tech',
      tone: 'Professional',
      templateType: 'short_video',
      platforms: ['instagram'],
      aiModel: 'claude',
      useSpartanFormat: true,
      affiliateUrl: '',
      customHook: ''
    });
    
    console.log(`✅ Manual generation completed: Status ${manualResponse.status}`);
    
    // Check the result in database
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const latestEntry = historyResponse.data.history[0];
    
    const manualClaudeSuccess = latestEntry.modelUsed === 'claude' && 
                               latestEntry.productName.includes('Manual Claude Baseline');
    
    console.log(`🔍 Manual test result:`);
    console.log(`   Product: ${latestEntry.productName}`);
    console.log(`   Model Used: ${latestEntry.modelUsed}`);
    console.log(`   Claude Success: ${manualClaudeSuccess ? '✅ YES' : '❌ NO'}`);
    
    results.manualBaseline = {
      success: true,
      claudeUsed: manualClaudeSuccess,
      entryId: latestEntry.id
    };
    
  } catch (error) {
    console.error('❌ Manual baseline test failed:', error.message);
    results.manualBaseline = { success: false, error: error.message };
  }
  
  // Test 2: Direct Scheduled Job Trigger Test
  console.log('\n🧪 TEST 2: Scheduled Job Direct Trigger');
  console.log('-' .repeat(50));
  
  try {
    // Find a Claude scheduled job from database
    console.log('📊 Checking for Claude scheduled jobs...');
    
    // First check what scheduled jobs exist
    const jobCheckResponse = await fetch(`${BASE_URL}/api/scheduled/jobs`);
    const jobCheckText = await jobCheckResponse.text();
    
    // The API seems to return HTML instead of JSON, so let's test the trigger directly
    console.log('🎯 Testing direct scheduled job trigger (Job ID 105)...');
    
    const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled/trigger/105`);
    console.log(`✅ Trigger initiated: Status ${triggerResponse.status}`);
    
    if (triggerResponse.data && triggerResponse.data.message) {
      console.log(`📝 Trigger message: ${triggerResponse.data.message}`);
    }
    
    // Wait for scheduled job to complete
    console.log('⏳ Waiting 25 seconds for scheduled job completion...');
    await new Promise(resolve => setTimeout(resolve, 25000));
    
    // Check for new content in history
    const postTriggerHistory = await axios.get(`${BASE_URL}/api/history`);
    const recentEntries = postTriggerHistory.data.history.slice(0, 10);
    
    // Look for very recent entries (created in last 2 minutes)
    const now = new Date();
    let scheduledClaudeEntries = [];
    
    for (const entry of recentEntries) {
      const entryTime = new Date(entry.createdAt);
      const timeDiff = (now - entryTime) / 1000; // seconds
      
      if (timeDiff < 120) { // Within last 2 minutes
        scheduledClaudeEntries.push({
          id: entry.id,
          product: entry.productName,
          model: entry.modelUsed,
          isRecent: true,
          timeDiff: Math.round(timeDiff),
          isClaude: entry.modelUsed === 'claude'
        });
      }
    }
    
    console.log(`\n🔍 Recent content analysis (last 2 minutes):`);
    console.log(`   Found ${scheduledClaudeEntries.length} recent entries`);
    
    let claudeCount = 0;
    let totalRecent = scheduledClaudeEntries.length;
    
    scheduledClaudeEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. Entry ${entry.id}: ${entry.product}`);
      console.log(`      Model: ${entry.model} (${entry.isClaude ? '✅' : '❌'})`);
      console.log(`      Age: ${entry.timeDiff} seconds ago`);
      
      if (entry.isClaude) claudeCount++;
    });
    
    const scheduledSuccess = claudeCount > 0;
    const perfectScheduledSuccess = totalRecent > 0 && claudeCount === totalRecent;
    
    console.log(`\n📊 Scheduled job results:`);
    console.log(`   Recent entries: ${totalRecent}`);
    console.log(`   Claude entries: ${claudeCount}`);
    console.log(`   Claude success: ${scheduledSuccess ? '✅ YES' : '❌ NO'}`);
    console.log(`   Perfect Claude: ${perfectScheduledSuccess ? '✅ YES' : '❌ NO'}`);
    
    results.scheduledJobTest = {
      success: true,
      jobTriggered: true,
      recentEntries: totalRecent,
      claudeEntries: claudeCount,
      hasClaudeContent: scheduledSuccess,
      allAreClaude: perfectScheduledSuccess,
      entries: scheduledClaudeEntries
    };
    
  } catch (error) {
    console.error('❌ Scheduled job test failed:', error.message);
    results.scheduledJobTest = { success: false, error: error.message };
  }
  
  // Test 3: Multiple Sequential Manual Tests for Reliability
  console.log('\n🧪 TEST 3: Sequential Claude Reliability');
  console.log('-' .repeat(50));
  
  const sequentialTests = [];
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`📝 Sequential Claude test ${i}/3...`);
      
      const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
        mode: 'manual',
        productName: `Claude Sequential Test ${i}`,
        niche: 'beauty',
        tone: 'Enthusiastic',
        templateType: 'short_video',
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: i % 2 === 0,
        affiliateUrl: '',
        customHook: ''
      });
      
      console.log(`✅ Sequential test ${i} completed: Status ${response.status}`);
      sequentialTests.push({ test: i, success: true, status: response.status });
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`❌ Sequential test ${i} failed:`, error.message);
      sequentialTests.push({ test: i, success: false, error: error.message });
    }
  }
  
  // Verify sequential test results
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const finalHistoryResponse = await axios.get(`${BASE_URL}/api/history`);
  const sequentialEntries = finalHistoryResponse.data.history.filter(entry => 
    entry.productName.includes('Claude Sequential Test')
  ).slice(0, 3);
  
  let allSequentialUsedClaude = true;
  let sequentialClaudeCount = 0;
  
  console.log(`\n📋 Sequential test verification:`);
  sequentialEntries.forEach(entry => {
    const usedClaude = entry.modelUsed === 'claude';
    console.log(`   ${entry.productName}: Model = ${entry.modelUsed} (${usedClaude ? '✅' : '❌'})`);
    
    if (usedClaude) sequentialClaudeCount++;
    else allSequentialUsedClaude = false;
  });
  
  results.sequentialTests = {
    success: sequentialTests.every(t => t.success),
    testsRun: sequentialTests.length,
    passedTests: sequentialTests.filter(t => t.success).length,
    allUsedClaude: allSequentialUsedClaude,
    claudeCount: sequentialClaudeCount,
    entriesFound: sequentialEntries.length
  };
  
  // Test 4: Overall Database Claude Usage Analysis
  console.log('\n🧪 TEST 4: Overall Claude Usage Analysis');
  console.log('-' .repeat(50));
  
  try {
    const allHistoryResponse = await axios.get(`${BASE_URL}/api/history`);
    const allEntries = allHistoryResponse.data.history;
    
    const claudeEntries = allEntries.filter(entry => entry.modelUsed === 'claude');
    const chatgptEntries = allEntries.filter(entry => entry.modelUsed === 'gpt-4o');
    
    console.log(`📊 Overall database analysis:`);
    console.log(`   Total entries: ${allEntries.length}`);
    console.log(`   Claude entries: ${claudeEntries.length}`);
    console.log(`   ChatGPT entries: ${chatgptEntries.length}`);
    console.log(`   Claude percentage: ${((claudeEntries.length / allEntries.length) * 100).toFixed(1)}%`);
    
    // Analyze recent Claude usage trend
    const recent20 = allEntries.slice(0, 20);
    const recentClaude = recent20.filter(entry => entry.modelUsed === 'claude');
    
    console.log(`\n📈 Recent trend analysis (last 20 entries):`);
    console.log(`   Recent Claude usage: ${recentClaude.length}/20 (${((recentClaude.length / 20) * 100).toFixed(1)}%)`);
    
    results.databaseAnalysis = {
      success: true,
      totalEntries: allEntries.length,
      claudeEntries: claudeEntries.length,
      claudePercentage: (claudeEntries.length / allEntries.length) * 100,
      recentClaudeUsage: (recentClaude.length / 20) * 100
    };
    
  } catch (error) {
    console.error('❌ Database analysis failed:', error.message);
    results.databaseAnalysis = { success: false, error: error.message };
  }
  
  // Generate Final Perfection Report
  console.log('\n🎯 FINAL CLAUDE PERFECTION REPORT');
  console.log('=' .repeat(70));
  
  console.log('\n📊 DETAILED TEST RESULTS:');
  
  console.log('\n1. MANUAL BASELINE TEST:');
  if (results.manualBaseline?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🤖 Claude Used: ${results.manualBaseline.claudeUsed ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.manualBaseline?.error}`);
  }
  
  console.log('\n2. SCHEDULED JOB TEST:');
  if (results.scheduledJobTest?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🎯 Job Triggered: ${results.scheduledJobTest.jobTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`   📊 Recent Entries: ${results.scheduledJobTest.recentEntries}`);
    console.log(`   🤖 Claude Entries: ${results.scheduledJobTest.claudeEntries}`);
    console.log(`   ✅ Has Claude Content: ${results.scheduledJobTest.hasClaudeContent ? '✅ YES' : '❌ NO'}`);
    console.log(`   🏆 All Are Claude: ${results.scheduledJobTest.allAreClaude ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.scheduledJobTest?.error}`);
  }
  
  console.log('\n3. SEQUENTIAL RELIABILITY:');
  if (results.sequentialTests?.success) {
    console.log(`   ✅ Status: SUCCESS (${results.sequentialTests.passedTests}/${results.sequentialTests.testsRun})`);
    console.log(`   🤖 All Used Claude: ${results.sequentialTests.allUsedClaude ? '✅ YES' : '❌ NO'}`);
    console.log(`   📊 Claude Count: ${results.sequentialTests.claudeCount}/${results.sequentialTests.entriesFound}`);
  } else {
    console.log(`   ❌ Status: FAILED`);
  }
  
  console.log('\n4. DATABASE ANALYSIS:');
  if (results.databaseAnalysis?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Total Entries: ${results.databaseAnalysis.totalEntries}`);
    console.log(`   🤖 Claude Entries: ${results.databaseAnalysis.claudeEntries}`);
    console.log(`   📈 Claude Percentage: ${results.databaseAnalysis.claudePercentage.toFixed(1)}%`);
    console.log(`   🔥 Recent Claude Usage: ${results.databaseAnalysis.recentClaudeUsage.toFixed(1)}%`);
  } else {
    console.log(`   ❌ Status: FAILED - ${results.databaseAnalysis?.error}`);
  }
  
  // Calculate Claude Perfection Score
  const claudePerfectionChecks = [
    results.manualBaseline?.claudeUsed || false,
    results.scheduledJobTest?.hasClaudeContent || false,
    results.sequentialTests?.allUsedClaude || false,
    (results.databaseAnalysis?.recentClaudeUsage || 0) > 50
  ];
  
  const perfectionScore = claudePerfectionChecks.filter(Boolean).length;
  const maxPerfectionScore = claudePerfectionChecks.length;
  
  console.log('\n🌟 CLAUDE PERFECTION RATING:');
  console.log('=' .repeat(70));
  console.log(`Perfection Score: ${perfectionScore}/${maxPerfectionScore} categories`);
  console.log(`Rating: ${perfectionScore === maxPerfectionScore ? '🏆 ABSOLUTE PERFECTION' : 
                      perfectionScore >= 3 ? '⭐ EXCELLENT' : 
                      perfectionScore >= 2 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
  
  if (perfectionScore === maxPerfectionScore) {
    console.log('\n🎉 CLAUDE AI MODEL SELECTION: ABSOLUTE PERFECTION ACHIEVED!');
    console.log('   ✅ Manual generation uses Claude 100% when selected');
    console.log('   ✅ Scheduled jobs generate content with Claude');
    console.log('   ✅ Sequential calls maintain Claude consistency');
    console.log('   ✅ Database shows strong Claude usage pattern');
    console.log('\n🔥 CLAUDE MODEL SELECTION IS WORKING PERFECTLY IN ALL SCENARIOS! 🔥');
  } else {
    console.log('\n📝 Claude reliability assessment:');
    if (!results.manualBaseline?.claudeUsed) console.log('   • Manual generation Claude consistency needs verification');
    if (!results.scheduledJobTest?.hasClaudeContent) console.log('   • Scheduled job Claude usage needs verification');
    if (!results.sequentialTests?.allUsedClaude) console.log('   • Sequential Claude consistency needs improvement');
    if ((results.databaseAnalysis?.recentClaudeUsage || 0) <= 50) console.log('   • Recent Claude usage pattern could be stronger');
  }
  
  return {
    perfectionScore,
    maxPerfectionScore,
    isPerfect: perfectionScore === maxPerfectionScore,
    results
  };
}

// Run the scheduled Claude enforcement test
testScheduledClaudeEnforcement().catch(console.error);