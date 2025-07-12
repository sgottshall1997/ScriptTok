/**
 * Debug Scheduled Claude Issue
 * Comprehensive investigation of why Claude isn't being used in scheduled jobs
 */

async function debugScheduledClaude() {
  console.log('🔍 DEBUGGING SCHEDULED CLAUDE ISSUE');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Check existing scheduled jobs
    console.log('\n📋 STEP 1: Checking Existing Scheduled Jobs');
    console.log('-'.repeat(40));
    
    const jobsResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs');
    const jobsData = await jobsResponse.json();
    
    if (jobsData.jobs && jobsData.jobs.length > 0) {
      console.log(`Found ${jobsData.jobs.length} scheduled jobs:`);
      jobsData.jobs.forEach(job => {
        console.log(`  Job ${job.id}: "${job.name}"`);
        console.log(`    - AI Model: ${job.aiModel || 'undefined'}`);
        console.log(`    - Spartan Format: ${job.useSpartanFormat || 'false'}`);
        console.log(`    - Active: ${job.isActive}`);
        console.log('');
      });
    } else {
      console.log('No scheduled jobs found');
    }
    
    // Step 2: Create a test scheduled job with Claude
    console.log('\n🧪 STEP 2: Creating Test Scheduled Job with Claude');
    console.log('-'.repeat(40));
    
    const createJobResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'DEBUG Claude Test Job',
        selectedNiches: ['tech'],
        tones: ['Professional'],
        templates: ['Short-Form Video Script'],
        platforms: ['tiktok'],
        scheduleTime: '16:00',
        timezone: 'America/New_York',
        useExistingProducts: true,
        generateAffiliateLinks: false,
        useSpartanFormat: true,  // Test Spartan format too
        useSmartStyle: false,
        aiModel: 'claude',       // CRITICAL: Test Claude
        affiliateId: 'debug123',
        sendToMakeWebhook: false,
        isActive: false          // Don't auto-schedule for testing
      })
    });
    
    if (createJobResponse.ok) {
      const createResult = await createJobResponse.json();
      const testJobId = createResult.job.id;
      
      console.log(`✅ Test job created: ID ${testJobId}`);
      console.log(`   AI Model stored: ${createResult.job.aiModel}`);
      console.log(`   Spartan Format: ${createResult.job.useSpartanFormat}`);
      
      // Step 3: Manually trigger the test job and capture logs
      console.log('\n🚀 STEP 3: Manually Triggering Test Job');
      console.log('-'.repeat(40));
      
      const triggerResponse = await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${testJobId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (triggerResponse.ok) {
        const triggerResult = await triggerResponse.json();
        console.log('✅ Test job triggered successfully');
        console.log('📋 Result:', triggerResult.message);
        
        // Wait a moment for completion
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check content history for the result
        console.log('\n📊 STEP 4: Checking Generated Content');
        console.log('-'.repeat(40));
        
        const historyResponse = await fetch('http://localhost:5000/api/content-history');
        const historyData = await historyResponse.json();
        
        // Find the most recent content (likely our test)
        if (historyData.contentHistory && historyData.contentHistory.length > 0) {
          const recentContent = historyData.contentHistory
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          
          console.log('🔍 Most Recent Generated Content:');
          console.log(`   Product: ${recentContent.productName}`);
          console.log(`   Created: ${recentContent.createdAt}`);
          console.log(`   AI Model Used: ${recentContent.aiModel || 'NOT RECORDED'}`);
          console.log(`   Spartan Format: ${recentContent.useSpartanFormat || 'NOT RECORDED'}`);
          
          // Check if content looks like Claude vs ChatGPT
          const content = recentContent.generatedOutput || recentContent.content || '';
          const isLikelyClaude = content.includes('Claude') || content.length < 100; // Claude tends to be more concise
          const isLikelyChatGPT = content.includes('ChatGPT') || content.length > 200;
          
          console.log('\n📝 Content Analysis:');
          console.log(`   Content Length: ${content.length} characters`);
          console.log(`   Likely Claude: ${isLikelyClaude ? 'YES' : 'NO'}`);
          console.log(`   Likely ChatGPT: ${isLikelyChatGPT ? 'YES' : 'NO'}`);
          
          if (content.length > 0) {
            console.log(`   Content Preview: "${content.substring(0, 150)}..."`);
          }
        }
        
      } else {
        console.log(`❌ Test job trigger failed: ${triggerResponse.status}`);
        const errorText = await triggerResponse.text();
        console.log(`Error: ${errorText}`);
      }
      
      // Cleanup: Delete test job
      await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${testJobId}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Test job cleaned up');
      
    } else {
      console.log(`❌ Test job creation failed: ${createJobResponse.status}`);
      const errorText = await createJobResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DEBUG COMPLETE - Check server logs for detailed enforcement messages');
}

// Run the debug
debugScheduledClaude().catch(console.error);