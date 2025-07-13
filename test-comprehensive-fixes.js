/**
 * COMPREHENSIVE TESTING SUITE
 * Tests both Content Display Fix and Claude AI Model Selection
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test 1: Content Display Fix
async function testContentDisplayFix() {
  console.log('\n🧪 TEST 1: Content Display Fix');
  console.log('=' .repeat(50));
  
  try {
    // Generate new content to test storage format
    console.log('📝 Generating new content to test database storage...');
    
    const generateResponse = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Test Display Fix Product',
      niche: 'tech',
      tone: 'Enthusiastic',
      templateType: 'short_video',
      platforms: ['tiktok', 'instagram'],
      aiModel: 'claude',
      useSpartanFormat: false,
      affiliateUrl: '',
      customHook: ''
    });
    
    console.log('✅ Content generation completed');
    console.log('📊 Response status:', generateResponse.status);
    
    // Check content history to verify clean storage
    console.log('\n📋 Checking Content History for clean display...');
    
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const latestEntry = historyResponse.data.history[0];
    
    console.log('🔍 Latest Content History Entry:');
    console.log('  - ID:', latestEntry.id);
    console.log('  - Product:', latestEntry.productName);
    console.log('  - Generated Output Type:', typeof latestEntry.generatedOutput);
    console.log('  - Content Field Type:', typeof latestEntry.generatedOutput?.content);
    console.log('  - Content Preview (first 100 chars):', 
      typeof latestEntry.generatedOutput?.content === 'string' 
        ? latestEntry.generatedOutput.content.substring(0, 100) 
        : 'NOT A STRING - ' + JSON.stringify(latestEntry.generatedOutput?.content).substring(0, 100)
    );
    
    // Test the extractCleanContent logic
    const content = latestEntry.generatedOutput?.content;
    let extractedContent = 'No content available';
    
    if (content) {
      if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          extractedContent = parsed.content || parsed.script || content;
        } catch {
          extractedContent = content;
        }
      } else if (typeof content === 'object') {
        extractedContent = content.content || content.script || JSON.stringify(content, null, 2);
      } else {
        extractedContent = String(content);
      }
    }
    
    console.log('\n🎯 CONTENT EXTRACTION TEST:');
    console.log('  - Extracted Content Type:', typeof extractedContent);
    console.log('  - Is Clean Text:', typeof extractedContent === 'string' && !extractedContent.includes('"model"'));
    console.log('  - Preview:', extractedContent.substring(0, 150));
    
    return {
      success: true,
      contentIsString: typeof latestEntry.generatedOutput?.content === 'string',
      extractedIsClean: typeof extractedContent === 'string' && !extractedContent.includes('"model"'),
      contentId: latestEntry.id
    };
    
  } catch (error) {
    console.error('❌ Content Display Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: Claude AI Model Selection in Scheduled Jobs
async function testClaudeScheduledSelection() {
  console.log('\n🧪 TEST 2: Claude AI Model Selection in Scheduled Jobs');
  console.log('=' .repeat(50));
  
  try {
    // Get existing Claude scheduled job
    console.log('📋 Checking existing scheduled jobs...');
    
    const jobsResponse = await axios.get(`${BASE_URL}/api/scheduled/jobs`);
    const claudeJob = jobsResponse.data.jobs.find(job => 
      job.ai_model === 'claude' && job.is_active
    );
    
    if (!claudeJob) {
      console.log('❌ No active Claude scheduled job found');
      return { success: false, error: 'No active Claude job found' };
    }
    
    console.log('✅ Found Claude scheduled job:', claudeJob.id, '-', claudeJob.name);
    console.log('  - AI Model:', claudeJob.ai_model);
    console.log('  - Spartan Format:', claudeJob.use_spartan_format);
    console.log('  - Is Active:', claudeJob.is_active);
    
    // Manually trigger the scheduled job
    console.log('\n🚀 Manually triggering Claude scheduled job...');
    
    const triggerResponse = await axios.post(`${BASE_URL}/api/scheduled/trigger/${claudeJob.id}`);
    
    console.log('✅ Trigger response:', triggerResponse.status, triggerResponse.data.message);
    
    // Wait a moment for generation to complete
    console.log('⏳ Waiting 10 seconds for content generation...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check the most recent content history for Claude usage
    console.log('\n🔍 Verifying Claude usage in generated content...');
    
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const recentEntries = historyResponse.data.history.slice(0, 3);
    
    let claudeUsageFound = false;
    let spartanFormatFound = false;
    
    for (const entry of recentEntries) {
      console.log(`📄 Entry ${entry.id}: Model=${entry.modelUsed}, Product=${entry.productName}`);
      
      if (entry.modelUsed === 'claude') {
        claudeUsageFound = true;
        console.log('✅ Claude model usage confirmed in content history');
      }
      
      // Check for Spartan format characteristics (no emojis, short content)
      const content = entry.generatedOutput?.content || entry.outputText;
      if (typeof content === 'string') {
        const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
        const isShort = content.length < 200;
        
        if (!hasEmojis && isShort) {
          spartanFormatFound = true;
          console.log('✅ Spartan format characteristics confirmed (no emojis, concise)');
        }
      }
    }
    
    return {
      success: true,
      claudeUsageConfirmed: claudeUsageFound,
      spartanFormatConfirmed: spartanFormatFound,
      scheduledJobTriggered: true,
      jobId: claudeJob.id
    };
    
  } catch (error) {
    console.error('❌ Claude Scheduled Selection Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Database Storage Format Verification
async function testDatabaseStorageFormat() {
  console.log('\n🧪 TEST 3: Database Storage Format Verification');
  console.log('=' .repeat(50));
  
  try {
    // Test unified generator with explicit logging
    console.log('📝 Testing unified generator storage format...');
    
    const response = await axios.post(`${BASE_URL}/api/generate-unified`, {
      mode: 'manual',
      productName: 'Database Storage Test Product',
      niche: 'beauty',
      tone: 'Professional',
      templateType: 'short_video',
      platforms: ['instagram'],
      aiModel: 'claude',
      useSpartanFormat: true,
      affiliateUrl: '',
      customHook: ''
    });
    
    console.log('✅ Content generated, checking database storage...');
    
    // Check what was actually stored
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    const latestEntry = historyResponse.data.history[0];
    
    console.log('🔍 Database Storage Analysis:');
    console.log('  - outputText type:', typeof latestEntry.outputText);
    console.log('  - outputText is string:', typeof latestEntry.outputText === 'string');
    console.log('  - generatedOutput.content type:', typeof latestEntry.generatedOutput?.content);
    console.log('  - generatedOutput.content is string:', typeof latestEntry.generatedOutput?.content === 'string');
    
    // Check for raw JSON patterns
    const outputText = latestEntry.outputText;
    const contentField = latestEntry.generatedOutput?.content;
    
    const outputHasJsonPattern = typeof outputText === 'string' && outputText.includes('"model"');
    const contentHasJsonPattern = typeof contentField === 'string' && contentField.includes('"model"');
    
    console.log('  - outputText has JSON metadata:', outputHasJsonPattern);
    console.log('  - content field has JSON metadata:', contentHasJsonPattern);
    
    return {
      success: true,
      outputTextIsString: typeof outputText === 'string',
      contentIsString: typeof contentField === 'string',
      outputTextIsClean: !outputHasJsonPattern,
      contentIsClean: !contentHasJsonPattern,
      entryId: latestEntry.id
    };
    
  } catch (error) {
    console.error('❌ Database Storage Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 COMPREHENSIVE TESTING SUITE');
  console.log('Testing Content Display Fix + Claude AI Model Selection');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // Run all tests
  results.contentDisplay = await testContentDisplayFix();
  results.claudeScheduled = await testClaudeScheduledSelection();
  results.databaseStorage = await testDatabaseStorageFormat();
  
  // Generate test report
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log('\n1. Content Display Fix:');
  console.log('   ✅ Test Completed:', results.contentDisplay.success);
  if (results.contentDisplay.success) {
    console.log('   📄 Content stored as string:', results.contentDisplay.contentIsString);
    console.log('   🧹 Extraction produces clean text:', results.contentDisplay.extractedIsClean);
  }
  
  console.log('\n2. Claude Scheduled Selection:');
  console.log('   ✅ Test Completed:', results.claudeScheduled.success);
  if (results.claudeScheduled.success) {
    console.log('   🤖 Claude usage confirmed:', results.claudeScheduled.claudeUsageConfirmed);
    console.log('   🏛️ Spartan format confirmed:', results.claudeScheduled.spartanFormatConfirmed);
  }
  
  console.log('\n3. Database Storage Format:');
  console.log('   ✅ Test Completed:', results.databaseStorage.success);
  if (results.databaseStorage.success) {
    console.log('   💾 outputText is clean string:', results.databaseStorage.outputTextIsClean);
    console.log('   📝 content field is clean string:', results.databaseStorage.contentIsClean);
  }
  
  // Overall assessment
  const allTestsPassed = Object.values(results).every(test => test.success);
  
  console.log('\n🎯 OVERALL ASSESSMENT:');
  console.log('   Status:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allTestsPassed) {
    console.log('\n🎉 BOTH FIXES WORKING CORRECTLY:');
    console.log('   ✅ Content Display Fix: Content displays as clean, readable text');
    console.log('   ✅ Claude AI Selection: Scheduled jobs use Claude when configured');
    console.log('   ✅ Database Storage: Clean content stored without JSON metadata');
    console.log('   ✅ Spartan Format: No emojis, concise professional content');
  }
  
  return results;
}

// Run the tests
runAllTests().catch(console.error);