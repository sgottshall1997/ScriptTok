/**
 * FINAL CLAUDE AI MODEL VERIFICATION TEST
 * Tests Claude AI model selection works every single time
 */

async function testClaudeEveryTime() {
  console.log('🎯 FINAL CLAUDE AI MODEL VERIFICATION TEST');
  console.log('=' .repeat(60));
  
  // Test 1: Check existing scheduled job
  console.log('\n📋 TEST 1: Checking Existing Scheduled Job');
  console.log('-'.repeat(40));
  
  const jobsResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs');
  const jobsData = await jobsResponse.json();
  
  const claudeJob = jobsData.jobs.find(job => job.aiModel === 'claude');
  if (claudeJob) {
    console.log(`✅ Found Claude job: "${claudeJob.name}"`);
    console.log(`   - AI Model: ${claudeJob.aiModel}`);
    console.log(`   - Spartan Format: ${claudeJob.useSpartanFormat}`);
    console.log(`   - Active: ${claudeJob.isActive}`);
  } else {
    console.log('❌ No Claude job found');
  }
  
  // Test 2: Create and test a new Claude job
  console.log('\n🧪 TEST 2: Creating New Claude Test Job');
  console.log('-'.repeat(40));
  
  const createJobResponse = await fetch('http://localhost:5000/api/scheduled-bulk/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'FINAL Claude Test - Spartan Format',
      selectedNiches: ['tech'],
      tones: ['Professional'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok'],
      scheduleTime: '16:30',
      timezone: 'America/New_York',
      useExistingProducts: true,
      generateAffiliateLinks: true,
      useSpartanFormat: true,  // Enable Spartan format
      useSmartStyle: false,
      aiModel: 'claude',       // Use Claude
      affiliateId: 'test123',
      sendToMakeWebhook: true,
      isActive: false          // Manual trigger only
    })
  });
  
  if (createJobResponse.ok) {
    const createResult = await createJobResponse.json();
    const testJobId = createResult.job.id;
    
    console.log(`✅ Test job created: ID ${testJobId}`);
    console.log(`   AI Model: ${createResult.job.aiModel}`);
    console.log(`   Spartan Format: ${createResult.job.useSpartanFormat}`);
    
    // Test 3: Test single content generation with Claude
    console.log('\n🚀 TEST 3: Testing Single Content Generation');
    console.log('-'.repeat(40));
    
    const singleContentResponse = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        productName: 'Test Product for Claude',
        niche: 'tech',
        tone: 'Professional',
        template: 'Short-Form Video Script',
        platforms: ['tiktok'],
        useSmartStyle: false,
        useSpartanFormat: true,
        aiModel: 'claude',
        affiliateId: 'test123',
        sendToMakeWebhook: false
      })
    });
    
    if (singleContentResponse.ok) {
      const singleResult = await singleContentResponse.json();
      console.log('✅ Single content generation successful');
      console.log(`   Content generated: ${singleResult.content ? 'YES' : 'NO'}`);
      console.log(`   AI Model used: ${singleResult.aiModel || 'NOT SPECIFIED'}`);
      console.log(`   Spartan format: ${singleResult.useSpartanFormat || 'NOT SPECIFIED'}`);
    } else {
      console.log('❌ Single content generation failed');
    }
    
    // Test 4: Test manual trigger of scheduled job
    console.log('\n🔥 TEST 4: Manual Scheduled Job Trigger');
    console.log('-'.repeat(40));
    
    const triggerResponse = await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${testJobId}/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (triggerResponse.ok) {
      const triggerResult = await triggerResponse.json();
      console.log('✅ Scheduled job triggered successfully');
      console.log(`   Message: ${triggerResult.message}`);
      
      // Wait and check content history
      console.log('\n⏳ Waiting 5 seconds for content generation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const historyResponse = await fetch('http://localhost:5000/api/content-history?limit=5');
      const historyData = await historyResponse.json();
      
      if (historyData.contentHistory && historyData.contentHistory.length > 0) {
        const recentContent = historyData.contentHistory[0];
        console.log('\n📊 Most Recent Generated Content:');
        console.log(`   Product: ${recentContent.productName}`);
        console.log(`   AI Model: ${recentContent.aiModel || 'NOT RECORDED'}`);
        console.log(`   Spartan Format: ${recentContent.useSpartanFormat || 'NOT RECORDED'}`);
        console.log(`   Created: ${recentContent.createdAt}`);
        
        // Analyze content for Claude characteristics
        const content = recentContent.generatedOutput || recentContent.content || '';
        const hasClaudeMarkers = content.includes('professional') || content.includes('factual') || content.includes('direct');
        const isSpartanFormat = content.length < 200 && !content.includes('✨') && !content.includes('🔥');
        
        console.log('\n🔍 Content Analysis:');
        console.log(`   Length: ${content.length} characters`);
        console.log(`   Has Claude markers: ${hasClaudeMarkers ? 'YES' : 'NO'}`);
        console.log(`   Spartan format applied: ${isSpartanFormat ? 'YES' : 'NO'}`);
        console.log(`   Preview: "${content.substring(0, 100)}..."`);
      }
    } else {
      console.log('❌ Scheduled job trigger failed');
    }
    
    // Cleanup
    await fetch(`http://localhost:5000/api/scheduled-bulk/jobs/${testJobId}`, {
      method: 'DELETE'
    });
    console.log('\n🗑️ Test job cleaned up');
    
  } else {
    console.log('❌ Test job creation failed');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CLAUDE AI MODEL VERIFICATION COMPLETE');
  console.log('✅ Check server logs for detailed Claude enforcement messages');
}

// Run the test
testClaudeEveryTime().catch(console.error);