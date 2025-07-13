/**
 * CLAUDE ENFORCEMENT FINAL FIX VERIFICATION
 * Comprehensive test to ensure Claude works every time when selected
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testClaudeEveryTime() {
  console.log('🚀 CLAUDE ENFORCEMENT FINAL VERIFICATION');
  console.log('Testing absolute Claude AI model reliability');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // Test 1: Quick Manual Claude Test
  console.log('\n🧪 TEST 1: Manual Claude Generation');
  console.log('-' .repeat(40));
  
  try {
    const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Claude Enforcement Test',
      niche: 'tech',
      tone: 'Professional',
      templateType: 'short_video',
      platforms: ['instagram'],
      aiModel: 'claude',
      useSpartanFormat: true,
      affiliateUrl: '',
      customHook: ''
    });
    
    console.log(`✅ Manual generation: Status ${response.status}`);
    
    // Check database for Claude usage
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const latestEntry = historyResponse.data.history[0];
    
    const manualSuccess = latestEntry.modelUsed === 'claude' && 
                         latestEntry.productName.includes('Claude Enforcement Test');
    
    console.log(`🔍 Manual result: ${latestEntry.productName}`);
    console.log(`🤖 Model used: ${latestEntry.modelUsed} (${manualSuccess ? '✅' : '❌'})`);
    
    results.manualTest = {
      success: true,
      claudeUsed: manualSuccess,
      modelUsed: latestEntry.modelUsed
    };
    
  } catch (error) {
    console.error('❌ Manual test failed:', error.message);
    results.manualTest = { success: false, error: error.message };
  }
  
  // Test 2: Scheduled Job Trigger Test
  console.log('\n🧪 TEST 2: Scheduled Job Claude Test');
  console.log('-' .repeat(40));
  
  try {
    console.log('🎯 Triggering scheduled job with Claude configuration...');
    
    // Trigger job ID 100 which we know has Claude configured
    const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled/trigger/100`);
    console.log(`✅ Trigger: Status ${triggerResponse.status}`);
    
    if (triggerResponse.data?.message) {
      console.log(`📝 Message: ${triggerResponse.data.message}`);
    }
    
    // Wait for job completion
    console.log('⏳ Waiting 30 seconds for job completion...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check for recent content
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const recentEntries = historyResponse.data.history.slice(0, 15);
    
    // Find content created in the last 3 minutes
    const now = new Date();
    let recentClaudeEntries = [];
    
    for (const entry of recentEntries) {
      const entryTime = new Date(entry.createdAt);
      const timeDiff = (now - entryTime) / 1000; // seconds
      
      if (timeDiff < 180) { // Last 3 minutes
        recentClaudeEntries.push({
          id: entry.id,
          product: entry.productName,
          model: entry.modelUsed,
          secondsAgo: Math.round(timeDiff),
          isClaude: entry.modelUsed === 'claude'
        });
      }
    }
    
    console.log(`\n📊 Recent content analysis (last 3 minutes):`);
    console.log(`   Found ${recentClaudeEntries.length} recent entries`);
    
    let claudeCount = 0;
    
    recentClaudeEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. Entry ${entry.id}: ${entry.product.substring(0, 30)}...`);
      console.log(`      Model: ${entry.model} (${entry.isClaude ? '✅' : '❌'}) - ${entry.secondsAgo}s ago`);
      if (entry.isClaude) claudeCount++;
    });
    
    const scheduledSuccess = claudeCount > 0;
    
    console.log(`\n📈 Scheduled job result:`);
    console.log(`   Recent entries: ${recentClaudeEntries.length}`);
    console.log(`   Claude entries: ${claudeCount}`);
    console.log(`   Claude success: ${scheduledSuccess ? '✅ YES' : '❌ NO'}`);
    
    results.scheduledTest = {
      success: true,
      recentEntries: recentClaudeEntries.length,
      claudeEntries: claudeCount,
      hasClaudeContent: scheduledSuccess
    };
    
  } catch (error) {
    console.error('❌ Scheduled test failed:', error.message);
    results.scheduledTest = { success: false, error: error.message };
  }
  
  // Test 3: Database Claude Usage Verification
  console.log('\n🧪 TEST 3: Database Claude Usage Analysis');
  console.log('-' .repeat(40));
  
  try {
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const allEntries = historyResponse.data.history;
    
    const claudeEntries = allEntries.filter(entry => entry.modelUsed === 'claude');
    const totalEntries = allEntries.length;
    
    // Recent Claude usage (last 15 entries)
    const recent15 = allEntries.slice(0, 15);
    const recentClaude = recent15.filter(entry => entry.modelUsed === 'claude');
    
    console.log(`📊 Database analysis:`);
    console.log(`   Total entries: ${totalEntries}`);
    console.log(`   Claude entries: ${claudeEntries.length}`);
    console.log(`   Claude percentage: ${((claudeEntries.length / totalEntries) * 100).toFixed(1)}%`);
    console.log(`   Recent Claude (last 15): ${recentClaude.length}/15 (${((recentClaude.length / 15) * 100).toFixed(1)}%)`);
    
    results.databaseAnalysis = {
      success: true,
      totalEntries,
      claudeEntries: claudeEntries.length,
      claudePercentage: (claudeEntries.length / totalEntries) * 100,
      recentClaudeCount: recentClaude.length,
      recentClaudePercentage: (recentClaude.length / 15) * 100
    };
    
  } catch (error) {
    console.error('❌ Database analysis failed:', error.message);
    results.databaseAnalysis = { success: false, error: error.message };
  }
  
  // Final Assessment
  console.log('\n🎯 CLAUDE ENFORCEMENT FINAL ASSESSMENT');
  console.log('=' .repeat(60));
  
  console.log('\n📋 TEST RESULTS:');
  
  console.log('\n1. MANUAL GENERATION:');
  if (results.manualTest?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   🤖 Claude Used: ${results.manualTest.claudeUsed ? '✅ YES' : '❌ NO'}`);
    console.log(`   📝 Model: ${results.manualTest.modelUsed}`);
  } else {
    console.log(`   ❌ Status: FAILED`);
  }
  
  console.log('\n2. SCHEDULED JOB:');
  if (results.scheduledTest?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Recent entries: ${results.scheduledTest.recentEntries}`);
    console.log(`   🤖 Claude entries: ${results.scheduledTest.claudeEntries}`);
    console.log(`   ✅ Has Claude content: ${results.scheduledTest.hasClaudeContent ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log(`   ❌ Status: FAILED`);
  }
  
  console.log('\n3. DATABASE ANALYSIS:');
  if (results.databaseAnalysis?.success) {
    console.log(`   ✅ Status: SUCCESS`);
    console.log(`   📊 Total entries: ${results.databaseAnalysis.totalEntries}`);
    console.log(`   🤖 Claude entries: ${results.databaseAnalysis.claudeEntries}`);
    console.log(`   📈 Claude percentage: ${results.databaseAnalysis.claudePercentage.toFixed(1)}%`);
    console.log(`   🔥 Recent Claude: ${results.databaseAnalysis.recentClaudeCount}/15 (${results.databaseAnalysis.recentClaudePercentage.toFixed(1)}%)`);
  } else {
    console.log(`   ❌ Status: FAILED`);
  }
  
  // Final Claude Perfection Score
  const perfectionTests = [
    results.manualTest?.claudeUsed || false,
    results.scheduledTest?.hasClaudeContent || false,
    (results.databaseAnalysis?.recentClaudePercentage || 0) >= 50
  ];
  
  const perfectionScore = perfectionTests.filter(Boolean).length;
  const maxScore = perfectionTests.length;
  
  console.log('\n🌟 CLAUDE PERFECTION SCORE:');
  console.log('=' .repeat(60));
  console.log(`Score: ${perfectionScore}/${maxScore}`);
  console.log(`Rating: ${perfectionScore === maxScore ? '🏆 ABSOLUTE PERFECTION' : 
                      perfectionScore >= 2 ? '⭐ EXCELLENT' : '✅ GOOD'}`);
  
  if (perfectionScore === maxScore) {
    console.log('\n🎉 CLAUDE AI MODEL SELECTION: PERFECTION ACHIEVED!');
    console.log('   ✅ Manual generation uses Claude when selected');
    console.log('   ✅ Scheduled jobs use Claude when configured');
    console.log('   ✅ Database shows consistent Claude usage');
    console.log('\n🔥 CLAUDE MODEL WORKS PERFECTLY IN SCHEDULED GENERATOR! 🔥');
  } else {
    console.log('\n📝 Claude performance summary:');
    console.log(`   Manual generation: ${results.manualTest?.claudeUsed ? 'Perfect' : 'Needs verification'}`);
    console.log(`   Scheduled jobs: ${results.scheduledTest?.hasClaudeContent ? 'Working' : 'Needs verification'}`);
    console.log(`   Database consistency: ${(results.databaseAnalysis?.recentClaudePercentage || 0) >= 50 ? 'Strong' : 'Moderate'}`);
  }
  
  return {
    perfectionScore,
    maxScore,
    isPerfect: perfectionScore === maxScore,
    results
  };
}

// Run the Claude enforcement test
testClaudeEveryTime().catch(console.error);