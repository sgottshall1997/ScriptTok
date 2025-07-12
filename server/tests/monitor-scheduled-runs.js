/**
 * 🔍 MONITOR SCHEDULED RUNS - Real-time tracking
 * Monitors active scheduled jobs and reports their execution
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function monitorScheduledRuns() {
  console.log('🔍 MONITORING ACTIVE SCHEDULED JOBS');
  console.log('=' .repeat(50));
  
  let monitoringCount = 0;
  const maxMonitoring = 30; // Monitor for 15 minutes (30 checks every 30 seconds)
  
  while (monitoringCount < maxMonitoring) {
    try {
      const timestamp = new Date().toISOString();
      console.log(`\n[${timestamp}] Check #${monitoringCount + 1}`);
      
      // Get current status
      const statusResponse = await axios.get(`${BASE_URL}/api/scheduled-bulk/status`);
      const activeCronJobs = statusResponse.data.totalActiveCronJobs || 0;
      
      console.log(`📊 Active cron jobs: ${activeCronJobs}`);
      
      // Get all jobs
      const jobsResponse = await axios.get(`${BASE_URL}/api/scheduled-bulk/jobs`);
      const jobs = jobsResponse.data.jobs || [];
      
      console.log(`📋 Database jobs: ${jobs.length}`);
      
      // Find active jobs
      const activeJobs = jobs.filter(job => job.isActive);
      console.log(`⚡ Active jobs: ${activeJobs.length}`);
      
      if (activeJobs.length > 0) {
        console.log('\n🎯 ACTIVE JOBS DETAILS:');
        activeJobs.forEach((job, index) => {
          console.log(`  ${index + 1}. "${job.name}" (ID: ${job.id})`);
          console.log(`     Schedule: ${job.scheduleTime} ${job.timezone}`);
          console.log(`     Niches: ${job.selectedNiches?.length || 0} (${job.selectedNiches?.join(', ') || 'none'})`);
          console.log(`     AI Model: ${job.aiModel || 'undefined'}`);
          console.log(`     Spartan: ${job.useSpartanFormat || false}`);
          console.log(`     Last Run: ${job.lastRunAt || 'Never'}`);
          console.log(`     Next Run: ${job.nextRunAt || 'Not scheduled'}`);
          console.log(`     Total Runs: ${job.totalRuns || 0}`);
          console.log('');
        });
        
        // Check for recent content generation
        console.log('🔍 CHECKING FOR RECENT CONTENT...');
        for (const job of activeJobs) {
          try {
            const contentResponse = await axios.get(`${BASE_URL}/api/bulk/content/${job.id}`);
            const content = contentResponse.data.content || [];
            
            // Check for content in last 10 minutes
            const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
            const recentContent = content.filter(item => {
              const createdAt = new Date(item.createdAt);
              return createdAt > tenMinutesAgo;
            });
            
            if (recentContent.length > 0) {
              console.log(`  ✅ Job "${job.name}": ${recentContent.length} recent content pieces`);
              recentContent.forEach(item => {
                console.log(`     - ${item.productName || 'Unknown'} (${item.niche}) at ${item.createdAt}`);
              });
            } else {
              console.log(`  ⏳ Job "${job.name}": No recent content (${content.length} total pieces)`);
            }
          } catch (error) {
            console.log(`  ❌ Job "${job.name}": Error checking content - ${error.message}`);
          }
        }
      }
      
      monitoringCount++;
      
      if (monitoringCount < maxMonitoring) {
        console.log(`\n⏱️ Waiting 30 seconds for next check...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
      
    } catch (error) {
      console.error(`❌ Monitoring error: ${error.message}`);
      monitoringCount++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on error
    }
  }
  
  console.log('\n🏁 Monitoring completed.');
}

// Run monitoring
monitorScheduledRuns()
  .then(() => {
    console.log('✅ Monitoring finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Monitoring failed:', error);
    process.exit(1);
  });