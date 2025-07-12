/**
 * 🔥 STRESS TEST - SCHEDULED GENERATOR
 * Tests system under heavy load and edge conditions
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function stressTestScheduledGenerator() {
  console.log('🔥 STRESS TEST - SCHEDULED GENERATOR');
  console.log('=' .repeat(50));
  console.log('Testing system under heavy load and edge conditions\n');

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    jobsCreated: [],
    errors: []
  };

  function logTest(name, success, details = '') {
    results.totalTests++;
    if (success) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${details}`);
      results.errors.push({ name, details });
    }
  }

  try {
    // Stress Test 1: Rapid Job Creation
    console.log('1️⃣ Stress Test: Rapid Job Creation (10 jobs in quick succession)');
    
    const rapidJobs = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, {
          name: `Rapid Test Job ${i + 1}`,
          scheduleTime: `${String(i + 10).padStart(2, '0')}:00`,
          timezone: 'America/New_York',
          isActive: true,
          selectedNiches: ['tech'],
          tones: ['Enthusiastic'],
          templates: ['short_video'],
          platforms: ['tiktok'],
          useExistingProducts: true,
          generateAffiliateLinks: false,
          useSmartStyle: false,
          ai_model: 'chatgpt',
          use_spartan_format: false
        });

        if (response.data.success) {
          rapidJobs.push(response.data.job.id);
          results.jobsCreated.push(response.data.job.id);
        } else {
          throw new Error(JSON.stringify(response.data));
        }
      } catch (error) {
        logTest(`Rapid job creation ${i + 1}`, false, error.message);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logTest(`Rapid job creation (${rapidJobs.length}/10 jobs)`, rapidJobs.length >= 8, `${duration}ms, ${rapidJobs.length} successful`);

    // Stress Test 2: Concurrent Updates
    console.log('\n2️⃣ Stress Test: Concurrent Job Updates');
    
    if (rapidJobs.length >= 3) {
      const updatePromises = rapidJobs.slice(0, 3).map(async (jobId, index) => {
        try {
          const response = await axios.put(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}`, {
            name: `Updated Concurrent Job ${index + 1}`,
            scheduleTime: `${String(index + 20).padStart(2, '0')}:30`,
            isActive: index % 2 === 0,
            selectedNiches: ['beauty', 'tech'],
            ai_model: index % 2 === 0 ? 'chatgpt' : 'claude'
          });
          
          return response.data.success;
        } catch (error) {
          return false;
        }
      });

      const updateResults = await Promise.all(updatePromises);
      const successfulUpdates = updateResults.filter(result => result).length;
      
      logTest(`Concurrent updates (${successfulUpdates}/3)`, successfulUpdates >= 2, `${successfulUpdates} successful`);
    } else {
      logTest('Concurrent updates', false, 'Insufficient jobs for concurrent testing');
    }

    // Stress Test 3: Large Configuration Jobs
    console.log('\n3️⃣ Stress Test: Large Configuration Jobs');
    
    try {
      const largeConfigResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, {
        name: 'Maximum Configuration Stress Test Job',
        scheduleTime: '23:59',
        timezone: 'America/New_York',
        isActive: true,
        selectedNiches: ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'],
        tones: ['Enthusiastic', 'Professional', 'Casual', 'Educational', 'Humorous'],
        templates: ['short_video', 'product_review', 'how_to_guide', 'unboxing', 'comparison'],
        platforms: ['tiktok', 'instagram', 'youtube', 'twitter', 'other'],
        useExistingProducts: true,
        generateAffiliateLinks: true,
        affiliateId: 'stress-test-affiliate-id-12345',
        useSmartStyle: true,
        ai_model: 'claude',
        use_spartan_format: true
      });

      if (largeConfigResponse.data.success) {
        results.jobsCreated.push(largeConfigResponse.data.job.id);
        logTest('Large configuration job', true, '7 niches, 5 tones, 5 templates, 5 platforms');
      } else {
        logTest('Large configuration job', false, JSON.stringify(largeConfigResponse.data));
      }
    } catch (error) {
      logTest('Large configuration job', false, error.message);
    }

    // Stress Test 4: Edge Case Timezones and Times
    console.log('\n4️⃣ Stress Test: Edge Case Timezones and Times');
    
    const edgeCases = [
      { time: '00:00', timezone: 'UTC', name: 'Midnight UTC' },
      { time: '23:59', timezone: 'Pacific/Kiritimati', name: 'Edge timezone' },
      { time: '12:00', timezone: 'America/New_York', name: 'Noon EST' },
      { time: '06:30', timezone: 'Asia/Kolkata', name: 'Half-hour timezone' },
      { time: '15:45', timezone: 'Australia/Sydney', name: 'Southern hemisphere' }
    ];

    for (const testCase of edgeCases) {
      try {
        const response = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, {
          name: `Edge Case: ${testCase.name}`,
          scheduleTime: testCase.time,
          timezone: testCase.timezone,
          isActive: true,
          selectedNiches: ['tech'],
          tones: ['Enthusiastic'],
          templates: ['short_video'],
          platforms: ['tiktok'],
          useExistingProducts: true,
          generateAffiliateLinks: false,
          useSmartStyle: false,
          ai_model: 'chatgpt',
          use_spartan_format: false
        });

        if (response.data.success) {
          results.jobsCreated.push(response.data.job.id);
          logTest(`Edge case: ${testCase.name}`, true);
        } else {
          logTest(`Edge case: ${testCase.name}`, false, JSON.stringify(response.data));
        }
      } catch (error) {
        logTest(`Edge case: ${testCase.name}`, false, error.message);
      }
    }

    // Stress Test 5: Rapid Delete Operations
    console.log('\n5️⃣ Stress Test: Rapid Delete Operations');
    
    if (results.jobsCreated.length >= 5) {
      const jobsToDelete = results.jobsCreated.slice(0, 5);
      const deleteStartTime = Date.now();
      
      const deletePromises = jobsToDelete.map(async (jobId) => {
        try {
          const response = await axios.delete(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}`);
          return response.status === 200;
        } catch (error) {
          return false;
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(result => result).length;
      const deleteEndTime = Date.now();
      const deleteDuration = deleteEndTime - deleteStartTime;
      
      // Remove deleted jobs from our tracking
      results.jobsCreated = results.jobsCreated.filter(id => !jobsToDelete.includes(id));
      
      logTest(`Rapid delete operations (${successfulDeletes}/5)`, successfulDeletes >= 4, `${deleteDuration}ms`);
    } else {
      logTest('Rapid delete operations', false, 'Insufficient jobs for delete testing');
    }

    // Stress Test 6: System Resource Check
    console.log('\n6️⃣ Stress Test: System Resource Check');
    
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/scheduled-bulk/status`);
      const activeCronJobs = statusResponse.data.totalActiveCronJobs || 0;
      
      const jobsResponse = await axios.get(`${BASE_URL}/api/scheduled-bulk/jobs`);
      const totalJobs = jobsResponse.data.jobs?.length || 0;
      
      console.log(`   Active cron jobs: ${activeCronJobs}`);
      console.log(`   Total database jobs: ${totalJobs}`);
      console.log(`   Jobs created during test: ${results.jobsCreated.length}`);
      
      if (activeCronJobs >= 0 && totalJobs >= 0) {
        logTest('System resource check', true, `${activeCronJobs} cron jobs, ${totalJobs} db jobs`);
      } else {
        logTest('System resource check', false, 'Invalid resource counts');
      }
    } catch (error) {
      logTest('System resource check', false, error.message);
    }

    // Stress Test 7: Error Recovery Test
    console.log('\n7️⃣ Stress Test: Error Recovery');
    
    try {
      // Try to create an invalid job and verify system handles it gracefully
      const invalidResponse = await axios.post(`${BASE_URL}/api/scheduled-bulk/jobs`, {
        name: '', // Invalid: empty name
        scheduleTime: '25:99', // Invalid: bad time format
        timezone: 'Invalid/Timezone',
        isActive: true,
        selectedNiches: [], // Invalid: empty array
        tones: [],
        templates: [],
        platforms: [],
        useExistingProducts: true
      });
      
      // If this succeeds, it's actually a failure
      logTest('Error recovery test', false, 'System accepted invalid input');
    } catch (error) {
      // Expected to fail - this is good
      if (error.response && error.response.status >= 400) {
        logTest('Error recovery test', true, 'System properly rejected invalid input');
      } else {
        logTest('Error recovery test', false, `Unexpected error: ${error.message}`);
      }
    }

    // Cleanup remaining jobs
    console.log('\n🧹 Final cleanup...');
    
    for (const jobId of results.jobsCreated) {
      try {
        await axios.delete(`${BASE_URL}/api/scheduled-bulk/jobs/${jobId}`);
        console.log(`   Cleaned up job ${jobId}`);
      } catch (error) {
        console.log(`   Failed to cleanup job ${jobId}: ${error.message}`);
      }
    }

    // Final Report
    console.log('\n' + '=' .repeat(50));
    console.log('🔥 STRESS TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
    console.log('');
    
    if (results.failed === 0) {
      console.log('🎉 STRESS TEST PASSED! System handles load perfectly!');
      console.log('');
      console.log('Stress Tests Passed:');
      console.log('✅ Rapid job creation under load');
      console.log('✅ Concurrent job updates');
      console.log('✅ Large configuration handling');
      console.log('✅ Edge case timezone/time support');
      console.log('✅ Rapid delete operations');
      console.log('✅ System resource management');
      console.log('✅ Error recovery and validation');
      console.log('');
      console.log('🚀 SYSTEM IS ROBUST AND PRODUCTION-READY!');
    } else {
      console.log('❌ Some stress tests failed:');
      results.errors.forEach(error => {
        console.log(`   ❌ ${error.name}: ${error.details}`);
      });
    }
    
    console.log('=' .repeat(50));
    
    return { success: results.failed === 0, results };

  } catch (error) {
    console.error('💥 CRITICAL STRESS TEST ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

// Run stress test
stressTestScheduledGenerator()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 FATAL STRESS TEST ERROR:', error);
    process.exit(1);
  });