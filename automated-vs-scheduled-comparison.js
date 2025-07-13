/**
 * AUTOMATED VS SCHEDULED GENERATOR COMPARISON TEST
 * Comprehensive investigation of why automated and scheduled generators might produce different outputs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function compareGenerators() {
  console.log('🔍 AUTOMATED VS SCHEDULED GENERATOR COMPARISON');
  console.log('=' .repeat(60));
  
  // Test configurations that should produce identical results
  const testConfig = {
    niche: 'beauty',
    tone: 'Professional', 
    template: 'Short-Form Video Script',
    platform: 'tiktok',
    aiModel: 'claude',
    useSpartanFormat: true
  };

  console.log('🧪 Testing with identical configuration:');
  console.log(`   Niche: ${testConfig.niche}`);
  console.log(`   Tone: ${testConfig.tone}`);
  console.log(`   Template: ${testConfig.template}`);
  console.log(`   Platform: ${testConfig.platform}`);
  console.log(`   AI Model: ${testConfig.aiModel}`);
  console.log(`   Spartan: ${testConfig.useSpartanFormat}`);
  
  let results = {};
  
  try {
    // Test 1: Automated Bulk Generator Path
    console.log('\n1️⃣ TESTING AUTOMATED BULK GENERATOR');
    console.log('-' .repeat(40));
    
    const automatedPayload = {
      mode: 'automated',
      selectedNiches: [testConfig.niche],
      tones: [testConfig.tone],
      templates: [testConfig.template],
      platforms: [testConfig.platform],
      useExistingProducts: true,
      aiModels: [testConfig.aiModel], // Array format for automated bulk
      useSpartanFormat: testConfig.useSpartanFormat,
      userId: 1
    };
    
    console.log('📤 Automated bulk payload:');
    console.log('   aiModels:', automatedPayload.aiModels);
    console.log('   useSpartanFormat:', automatedPayload.useSpartanFormat);
    
    const automatedResponse = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-generation-source': 'manual_ui'
      },
      body: JSON.stringify(automatedPayload)
    });

    const automatedResult = await automatedResponse.json();
    
    if (automatedResult.success && automatedResult.results?.[0]) {
      const result = automatedResult.results[0];
      results.automated = {
        aiModel: result.aiModel,
        useSpartanFormat: result.useSpartanFormat,
        contentLength: result.generatedContent?.length || 0,
        content: result.generatedContent?.substring(0, 100) + '...',
        productName: result.productName,
        niche: result.niche,
        platforms: result.platforms
      };
      console.log('✅ Automated result:', {
        aiModel: result.aiModel,
        spartan: result.useSpartanFormat,
        length: result.generatedContent?.length,
        product: result.productName
      });
    } else {
      console.log('❌ Automated failed:', automatedResult.error);
      results.automated = { error: automatedResult.error };
    }

    // Test 2: Scheduled Generator Path (simulated)
    console.log('\n2️⃣ TESTING SCHEDULED GENERATOR PATH');
    console.log('-' .repeat(40));
    
    const scheduledPayload = {
      mode: 'automated',
      selectedNiches: [testConfig.niche],
      tones: [testConfig.tone],
      templates: [testConfig.template],
      platforms: [testConfig.platform],
      useExistingProducts: true,
      aiModel: testConfig.aiModel, // String format for scheduled jobs
      useSpartanFormat: testConfig.useSpartanFormat,
      userId: 1,
      scheduledJobId: 999 // Mark as scheduled
    };
    
    console.log('📤 Scheduled job payload:');
    console.log('   aiModel:', scheduledPayload.aiModel);
    console.log('   useSpartanFormat:', scheduledPayload.useSpartanFormat);
    console.log('   scheduledJobId:', scheduledPayload.scheduledJobId);
    
    const scheduledResponse = await fetch(`${BASE_URL}/api/generate-unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-generation-source': 'scheduled_job'
      },
      body: JSON.stringify(scheduledPayload)
    });

    const scheduledResult = await scheduledResponse.json();
    
    if (scheduledResult.success && scheduledResult.results?.[0]) {
      const result = scheduledResult.results[0];
      results.scheduled = {
        aiModel: result.aiModel,
        useSpartanFormat: result.useSpartanFormat,
        contentLength: result.generatedContent?.length || 0,
        content: result.generatedContent?.substring(0, 100) + '...',
        productName: result.productName,
        niche: result.niche,
        platforms: result.platforms
      };
      console.log('✅ Scheduled result:', {
        aiModel: result.aiModel,
        spartan: result.useSpartanFormat,
        length: result.generatedContent?.length,
        product: result.productName
      });
    } else {
      console.log('❌ Scheduled failed:', scheduledResult.error);
      results.scheduled = { error: scheduledResult.error };
    }

    // Analysis
    console.log('\n📊 COMPARISON ANALYSIS');
    console.log('=' .repeat(60));
    
    if (results.automated.error || results.scheduled.error) {
      console.log('❌ Cannot compare - one or both tests failed');
      if (results.automated.error) console.log('   Automated error:', results.automated.error);
      if (results.scheduled.error) console.log('   Scheduled error:', results.scheduled.error);
      return false;
    }
    
    const differences = [];
    
    // Compare AI Models
    if (results.automated.aiModel !== results.scheduled.aiModel) {
      differences.push(`AI Model: automated="${results.automated.aiModel}" vs scheduled="${results.scheduled.aiModel}"`);
    }
    
    // Compare Spartan Format
    if (results.automated.useSpartanFormat !== results.scheduled.useSpartanFormat) {
      differences.push(`Spartan Format: automated="${results.automated.useSpartanFormat}" vs scheduled="${results.scheduled.useSpartanFormat}"`);
    }
    
    // Compare Product Selection
    if (results.automated.productName !== results.scheduled.productName) {
      differences.push(`Product: automated="${results.automated.productName}" vs scheduled="${results.scheduled.productName}"`);
    }
    
    // Compare Content Length (allowing 10% variance)
    const lengthDiff = Math.abs(results.automated.contentLength - results.scheduled.contentLength);
    const lengthVariance = lengthDiff / Math.max(results.automated.contentLength, results.scheduled.contentLength);
    if (lengthVariance > 0.1) {
      differences.push(`Content Length: automated=${results.automated.contentLength} vs scheduled=${results.scheduled.contentLength} (${(lengthVariance * 100).toFixed(1)}% difference)`);
    }
    
    console.log('🔍 RESULTS:');
    console.log('   Automated:');
    console.log(`     AI Model: ${results.automated.aiModel}`);
    console.log(`     Spartan: ${results.automated.useSpartanFormat}`);
    console.log(`     Product: ${results.automated.productName}`);
    console.log(`     Length: ${results.automated.contentLength} chars`);
    console.log('   Scheduled:');
    console.log(`     AI Model: ${results.scheduled.aiModel}`);
    console.log(`     Spartan: ${results.scheduled.useSpartanFormat}`);
    console.log(`     Product: ${results.scheduled.productName}`);
    console.log(`     Length: ${results.scheduled.contentLength} chars`);
    
    if (differences.length === 0) {
      console.log('\n✅ PERFECT MATCH! Both generators produce identical results');
      return true;
    } else {
      console.log('\n❌ DIFFERENCES FOUND:');
      differences.forEach((diff, i) => {
        console.log(`   ${i + 1}. ${diff}`);
      });
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test the actual scheduled job API
async function testRealScheduledJob() {
  console.log('\n🕒 TESTING REAL SCHEDULED JOB API');
  console.log('=' .repeat(50));
  
  try {
    // Get existing scheduled jobs
    const jobsResponse = await fetch(`${BASE_URL}/api/scheduled-jobs`);
    const jobs = await jobsResponse.json();
    
    if (!jobs.success || jobs.data.length === 0) {
      console.log('⚠️ No scheduled jobs found to test');
      return false;
    }
    
    // Find a Claude job
    const claudeJob = jobs.data.find(job => job.ai_model === 'claude');
    if (!claudeJob) {
      console.log('⚠️ No Claude scheduled jobs found');
      return false;
    }
    
    console.log(`📅 Testing scheduled job: ${claudeJob.name} (ID: ${claudeJob.id})`);
    console.log(`   AI Model: ${claudeJob.ai_model}`);
    console.log(`   Spartan: ${claudeJob.use_spartan_format}`);
    console.log(`   Niches: ${claudeJob.selected_niches}`);
    console.log(`   Next run: ${claudeJob.next_run}`);
    
    // Trigger the job manually
    const triggerResponse = await fetch(`${BASE_URL}/api/scheduled-jobs/${claudeJob.id}/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const triggerResult = await triggerResponse.json();
    
    if (triggerResult.success) {
      console.log('✅ Scheduled job triggered successfully');
      console.log(`   Generated: ${triggerResult.generatedCount} content pieces`);
      return true;
    } else {
      console.log('❌ Scheduled job failed:', triggerResult.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Scheduled job test failed:', error.message);
    return false;
  }
}

// Run comprehensive tests
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE GENERATOR COMPARISON TESTS');
  console.log('=' .repeat(70));
  
  const comparisonResult = await compareGenerators();
  const scheduledJobResult = await testRealScheduledJob();
  
  console.log('\n🏁 FINAL TEST RESULTS');
  console.log('=' .repeat(70));
  console.log(`   Generator Comparison: ${comparisonResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Scheduled Job Test: ${scheduledJobResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = comparisonResult && scheduledJobResult;
  console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ ISSUES FOUND'}`);
  
  if (!allPassed) {
    console.log('\n🔧 RECOMMENDATIONS:');
    if (!comparisonResult) {
      console.log('   - Fix parameter handling consistency between automated and scheduled paths');
      console.log('   - Ensure AI model selection priority logic works correctly');
      console.log('   - Verify Spartan format is applied consistently');
    }
    if (!scheduledJobResult) {
      console.log('   - Check scheduled job configuration and execution');
      console.log('   - Verify scheduled job database schema and parameters');
    }
  }
  
  return allPassed;
}

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { compareGenerators, testRealScheduledJob, runAllTests };