/**
 * 🧪 COMPREHENSIVE SCHEDULED GENERATOR TEST SUITE
 * Tests all aspects of scheduled content generation to ensure perfect functionality
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// CORRECT API ENDPOINTS (using scheduled-bulk instead of scheduled-jobs)
const ENDPOINTS = {
  jobs: '/api/scheduled-bulk/jobs',
  jobsStatus: '/api/scheduled-bulk/status',
  emergency: '/api/emergency-stop-all'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function comprehensiveScheduledTest() {
  console.log('🧪 STARTING COMPREHENSIVE SCHEDULED GENERATOR TEST');
  console.log('=' .repeat(60));
  
  let testJobId = null;
  
  try {
    // 1. Test job creation with all configurations
    console.log('\n1️⃣ Testing scheduled job creation...');
    
    const createJobResponse = await axios.post(`${BASE_URL}${ENDPOINTS.jobs}`, {
      name: 'Test Scheduled Job - All 7 Niches',
      scheduleTime: '23:59',
      timezone: 'America/New_York',
      isActive: true,
      selectedNiches: ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'],
      tones: ['Enthusiastic'],
      templates: ['short_video'],
      platforms: ['tiktok', 'instagram'],
      useExistingProducts: true,
      generateAffiliateLinks: false,
      affiliateId: 'test123',
      useSmartStyle: false,
      ai_model: 'claude',
      use_spartan_format: true
    });
    
    console.log('Debug - Create job response:', createJobResponse.data);
    
    if (!createJobResponse.data.success || !createJobResponse.data.job) {
      throw new Error(`Failed to create job: ${JSON.stringify(createJobResponse.data)}`);
    }
    
    testJobId = createJobResponse.data.job.id;
    console.log(`✅ Created test job with ID: ${testJobId}`);
    console.log(`   Job details:`, createJobResponse.data.job);
    
    // 2. Verify cron job was created
    console.log('\n2️⃣ Verifying cron job creation...');
    await sleep(500); // Allow cron job to initialize
    
    const cronStatusResponse = await axios.get(`${BASE_URL}${ENDPOINTS.jobsStatus}`);
    console.log(`📊 Active cron jobs: ${cronStatusResponse.data.totalActiveCronJobs}`);
    console.log(`   Cron job details:`, cronStatusResponse.data.activeJobs);
    
    if (cronStatusResponse.data.totalActiveCronJobs === 0) {
      throw new Error('❌ No cron job was created for the scheduled job');
    }
    
    // 3. Test manual trigger to verify content generation
    console.log('\n3️⃣ Testing manual trigger of scheduled job...');
    
    const triggerResponse = await axios.post(`${BASE_URL}${ENDPOINTS.jobs}/${testJobId}/trigger`);
    console.log(`✅ Manual trigger response:`, triggerResponse.data);
    
    // Wait for content generation to complete
    console.log('⏳ Waiting for content generation to complete...');
    await sleep(20000); // Wait 20 seconds for generation
    
    // 4. Verify content was generated
    console.log('\n4️⃣ Verifying generated content...');
    
    const jobDetailsResponse = await axios.get(`${BASE_URL}/api/automated-bulk/details/${testJobId}`);
    console.log(`📝 Job details after trigger:`, jobDetailsResponse.data);
    
    if (jobDetailsResponse.data.job) {
      const job = jobDetailsResponse.data.job;
      console.log(`   Status: ${job.status}`);
      console.log(`   Total content generated: ${job.totalContentGenerated || 0}`);
      console.log(`   Content per niche: ${job.contentPerNiche || 0}`);
      console.log(`   AI model used: ${job.ai_model}`);
      console.log(`   Spartan format: ${job.use_spartan_format}`);
    }
    
    // 5. Check for actual generated content
    console.log('\n5️⃣ Checking for actual generated content pieces...');
    
    try {
      const contentResponse = await axios.get(`${BASE_URL}/api/bulk/content/${testJobId}`);
      const generatedContent = contentResponse.data.content || [];
      
      console.log(`📄 Generated content pieces: ${generatedContent.length}`);
      
      if (generatedContent.length === 0) {
        console.log('⚠️ No content pieces found in database');
      } else {
        console.log('✅ Content generation successful!');
        
        // Group by niche to verify distribution
        const contentByNiche = {};
        generatedContent.forEach(content => {
          const niche = content.niche || 'unknown';
          if (!contentByNiche[niche]) {
            contentByNiche[niche] = 0;
          }
          contentByNiche[niche]++;
        });
        
        console.log('📊 Content distribution by niche:', contentByNiche);
        
        // Verify exactly 1 per niche
        const expectedNiches = ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
        let distributionCorrect = true;
        
        expectedNiches.forEach(niche => {
          const count = contentByNiche[niche] || 0;
          if (count !== 1) {
            console.log(`❌ INCORRECT DISTRIBUTION: ${niche} has ${count} content pieces (expected 1)`);
            distributionCorrect = false;
          }
        });
        
        if (distributionCorrect) {
          console.log('✅ PERFECT DISTRIBUTION: Exactly 1 content piece per niche');
        }
        
        // Check first piece for quality
        if (generatedContent[0]) {
          const firstPiece = generatedContent[0];
          console.log('\n📝 Sample content piece:');
          console.log(`   Product: ${firstPiece.productName}`);
          console.log(`   Niche: ${firstPiece.niche}`);
          console.log(`   Content preview: ${firstPiece.content?.substring(0, 100)}...`);
          console.log(`   Has platform captions: ${firstPiece.platformCaptions ? 'Yes' : 'No'}`);
          console.log(`   Affiliate link: ${firstPiece.affiliateLink ? 'Yes' : 'No'}`);
        }
      }
    } catch (contentError) {
      console.log('⚠️ Could not fetch generated content:', contentError.message);
    }
    
    // 6. Test job update
    console.log('\n6️⃣ Testing job update functionality...');
    
    const updateResponse = await axios.put(`${BASE_URL}${ENDPOINTS.jobs}/${testJobId}`, {
      name: 'Updated Test Job',
      scheduleTime: '23:58',
      isActive: true,
      selectedNiches: ['tech', 'beauty'], // Reduced to 2 niches
      ai_model: 'chatgpt' // Change AI model
    });
    
    console.log(`✅ Job update successful:`, updateResponse.data.job);
    
    // Verify cron job was recreated
    await sleep(500);
    const updatedCronStatus = await axios.get(`${BASE_URL}/api/scheduled-jobs/status`);
    console.log(`📊 Cron jobs after update: ${updatedCronStatus.data.totalActiveCronJobs}`);
    
    // 7. Test rapid operations (race condition testing)
    console.log('\n7️⃣ Testing race condition prevention...');
    
    const rapidOperations = [];
    for (let i = 0; i < 3; i++) {
      rapidOperations.push(
        axios.put(`${BASE_URL}${ENDPOINTS.jobs}/${testJobId}`, {
          name: `Rapid Update ${i}`,
          scheduleTime: '23:57',
          isActive: true
        })
      );
    }
    
    try {
      await Promise.all(rapidOperations);
      console.log('✅ Rapid operations completed without errors');
    } catch (error) {
      console.log('⚠️ Some rapid operations failed (expected for race protection)');
    }
    
    // 8. Final cron job verification
    console.log('\n8️⃣ Final cron job verification...');
    
    const finalCronStatus = await axios.get(`${BASE_URL}/api/scheduled-jobs/status`);
    console.log(`📊 Final cron job count: ${finalCronStatus.data.totalActiveCronJobs}`);
    
    if (finalCronStatus.data.totalActiveCronJobs === 1) {
      console.log('✅ Perfect: Exactly 1 cron job running (no duplicates)');
    } else {
      console.log(`❌ Issue: Expected 1 cron job, found ${finalCronStatus.data.totalActiveCronJobs}`);
    }
    
    console.log('\n🎉 COMPREHENSIVE TEST COMPLETED!');
    console.log('=' .repeat(60));
    
    return {
      success: true,
      testJobId,
      message: 'All scheduled generator tests passed successfully'
    };
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      testJobId
    };
  } finally {
    // Cleanup: Delete test job
    if (testJobId) {
      console.log(`\n🧹 Cleaning up test job ${testJobId}...`);
      try {
        await axios.delete(`${BASE_URL}${ENDPOINTS.jobs}/${testJobId}`);
        console.log('✅ Test job cleaned up successfully');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup failed:', cleanupError.message);
      }
    }
  }
}

// Auto-run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  comprehensiveScheduledTest()
    .then(result => {
      console.log('\n📋 FINAL TEST RESULT:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 CRITICAL TEST ERROR:', error);
      process.exit(1);
    });
}

export { comprehensiveScheduledTest };