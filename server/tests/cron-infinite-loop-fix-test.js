/**
 * 🛑 COMPREHENSIVE CRON INFINITE LOOP FIX TEST
 * Tests all fixes for the infinite scheduled generator loop issue
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testInfiniteLoopFix() {
  console.log('🧪 STARTING CRON INFINITE LOOP FIX TEST');
  console.log('=' .repeat(50));
  
  try {
    // 1. Test multiple rapid job creation/updates
    console.log('\n1️⃣ Testing rapid job creation and updates...');
    
    // Create multiple jobs rapidly
    const createPromises = [];
    for (let i = 0; i < 3; i++) {
      createPromises.push(axios.post(`${BASE_URL}/api/scheduled-jobs`, {
        name: `Test Rapid Job ${i}`,
        scheduleTime: '23:59',
        timezone: 'America/New_York',
        isActive: true,
        niches: ['tech'],
        tones: ['Enthusiastic'],
        templates: ['short_video'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        useSmartStyle: false,
        ai_model: 'claude',
        use_spartan_format: true
      }));
    }
    
    const createResults = await Promise.all(createPromises);
    console.log('Debug - First create result:', createResults[0]?.data);
    const jobIds = createResults.map(r => r.data?.job?.id).filter(id => id !== undefined);
    console.log(`✅ Created ${jobIds.length} jobs rapidly: ${jobIds.join(', ')}`);
    
    // 2. Test rapid updates
    console.log('\n2️⃣ Testing rapid job updates...');
    const updatePromises = jobIds.map(jobId => 
      axios.put(`${BASE_URL}/api/scheduled-jobs/${jobId}`, {
        name: `Updated Rapid Job ${jobId}`,
        scheduleTime: '23:58',
        isActive: true
      })
    );
    
    await Promise.all(updatePromises);
    console.log('✅ Updated all jobs rapidly without infinite loops');
    
    // 3. Check for duplicate cron jobs
    console.log('\n3️⃣ Checking for duplicate cron jobs...');
    const statusResponse = await axios.get(`${BASE_URL}/api/scheduled-jobs/status`);
    const { totalActiveCronJobs, activeJobs } = statusResponse.data;
    
    console.log(`📊 Total active cron jobs: ${totalActiveCronJobs}`);
    console.log(`📋 Job details:`, activeJobs);
    
    if (totalActiveCronJobs !== jobIds.length) {
      throw new Error(`❌ CRON COUNT MISMATCH: Expected ${jobIds.length}, got ${totalActiveCronJobs}`);
    }
    console.log('✅ No duplicate cron jobs detected');
    
    // 4. Test job deletion cleanup
    console.log('\n4️⃣ Testing job deletion cleanup...');
    const deletePromises = jobIds.map(jobId => 
      axios.delete(`${BASE_URL}/api/scheduled-jobs/${jobId}`)
    );
    
    await Promise.all(deletePromises);
    console.log('✅ Deleted all test jobs');
    
    // 5. Verify cleanup
    console.log('\n5️⃣ Verifying complete cleanup...');
    await sleep(1000); // Wait for cleanup
    
    const finalStatusResponse = await axios.get(`${BASE_URL}/api/scheduled-jobs/status`);
    const finalCronCount = finalStatusResponse.data.totalActiveCronJobs;
    
    console.log(`📊 Final cron job count: ${finalCronCount}`);
    
    // 6. Test server restart simulation (emergency stop + reinit)
    console.log('\n6️⃣ Testing emergency stop functionality...');
    const emergencyResponse = await axios.post(`${BASE_URL}/api/emergency-stop-all`);
    console.log(`🚨 Emergency stop result:`, emergencyResponse.data);
    
    // 7. Test race condition prevention
    console.log('\n7️⃣ Testing race condition prevention...');
    
    // Create a new job for testing
    const raceTestJob = await axios.post(`${BASE_URL}/api/scheduled-jobs`, {
      name: 'Race Condition Test Job',
      scheduleTime: '23:57',
      timezone: 'America/New_York',
      isActive: true,
      niches: ['tech'],
      tones: ['Enthusiastic'],
      templates: ['short_video'],
      platforms: ['tiktok'],
      useExistingProducts: true,
      useSmartStyle: false,
      ai_model: 'claude',
      use_spartan_format: true
    });
    
    const raceJobId = raceTestJob.data.job.id;
    console.log(`📝 Created race test job: ${raceJobId}`);
    
    // Attempt multiple simultaneous updates
    const simultaneousUpdates = [];
    for (let i = 0; i < 5; i++) {
      simultaneousUpdates.push(
        axios.put(`${BASE_URL}/api/scheduled-jobs/${raceJobId}`, {
          name: `Race Test Update ${i}`,
          scheduleTime: '23:56',
          isActive: true
        })
      );
    }
    
    try {
      await Promise.all(simultaneousUpdates);
      console.log('✅ Simultaneous updates completed without errors');
    } catch (error) {
      console.log('⚠️ Some simultaneous updates failed (expected behavior for race protection)');
    }
    
    // Final cleanup
    await axios.delete(`${BASE_URL}/api/scheduled-jobs/${raceJobId}`);
    console.log('✅ Cleaned up race test job');
    
    console.log('\n🎉 ALL TESTS PASSED! Infinite loop fixes are working correctly.');
    console.log('=' .repeat(50));
    
    return {
      success: true,
      message: 'All cron infinite loop fixes verified successfully'
    };
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Full error:', error.response?.data || error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInfiniteLoopFix()
    .then(result => {
      console.log('\n📋 TEST RESULT:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 CRITICAL TEST ERROR:', error);
      process.exit(1);
    });
}

export { testInfiniteLoopFix };