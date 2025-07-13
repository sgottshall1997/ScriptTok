/**
 * Debug Scheduled Claude Issue
 * Comprehensive investigation of why Claude isn't being used in scheduled jobs
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function debugScheduledClaude() {
  console.log('🔍 DEBUG: SCHEDULED CLAUDE ISSUE INVESTIGATION 🔍\n');
  
  try {
    // First, let's check what scheduled jobs exist
    console.log('📋 Step 1: Checking scheduled jobs in database...');
    
    // Simulate what happens when a scheduled job executes
    console.log('\n🎯 Step 2: Simulating scheduled job execution...');
    
    const scheduledJobPayload = {
      mode: 'automated',
      selectedNiches: ['beauty'],
      tones: ['Professional'],
      templates: ['Short-Form Video Script'],
      platforms: ['tiktok'],
      useExistingProducts: true,
      aiModel: 'claude',         // This should be used
      useSpartanFormat: true,
      scheduledJobId: 107        // Actual scheduled job ID
    };
    
    console.log('📊 Scheduled Job Configuration:');
    console.log('   Job ID:', scheduledJobPayload.scheduledJobId);
    console.log('   AI Model:', scheduledJobPayload.aiModel);
    console.log('   Spartan Format:', scheduledJobPayload.useSpartanFormat);
    console.log('   Mode:', scheduledJobPayload.mode);
    
    console.log('\n🚀 Sending request to unified generator...');
    
    const response = await axios.post(`${BASE_URL}/api/generate-unified`, scheduledJobPayload, {
      timeout: 60000
    });
    
    if (response.data && response.data.success) {
      console.log('\n✅ Content generation completed!');
      console.log(`📊 Generated ${response.data.results?.length || 0} content pieces`);
      
      // Check each result for AI model used
      response.data.results?.forEach((result, index) => {
        console.log(`\n📝 Content Piece ${index + 1}:`);
        console.log('   Product:', result.productName);
        console.log('   AI Model Used:', result.aiModel || 'UNDEFINED');
        console.log('   Spartan Format:', result.useSpartanFormat ? 'Yes' : 'No');
        console.log('   Content Length:', result.content?.length || 0, 'chars');
        
        // This is the key test - what AI model was actually used?
        if (result.aiModel === 'claude' || result.aiModel === 'Claude') {
          console.log('   ✅ SUCCESS: Claude was used correctly');
        } else {
          console.log('   ❌ ISSUE: Expected Claude, got:', result.aiModel);
        }
      });
      
    } else {
      console.log('\n❌ Content generation failed:', response.data?.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('\n❌ Debug test failed:', error.response?.data?.error || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️ Server connection issue, but let\'s check the code logic...');
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 DEBUGGING CONCLUSIONS');
  console.log('='.repeat(70));
  
  console.log('\n🔍 Key Questions to Investigate:');
  console.log('1. Does the scheduled job table have ai_model="claude"?');
  console.log('2. Is the executeScheduledJob() function passing aiModel correctly?');
  console.log('3. Is the unified generator receiving the correct aiModel parameter?');
  console.log('4. Is there a different code path for scheduled vs manual execution?');
  
  console.log('\n🔧 Potential Issues:');
  console.log('- Scheduled job execution might use different parameter mapping');
  console.log('- There might be override logic in scheduled job execution');
  console.log('- The aiModel field might not be passed from scheduled job data');
  console.log('- There could be environment-specific behavior differences');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check scheduled job execution code path');
  console.log('2. Verify parameter passing from scheduled jobs');
  console.log('3. Add debug logging to scheduled job execution');
  console.log('4. Test manual trigger of specific scheduled job');
}

debugScheduledClaude();