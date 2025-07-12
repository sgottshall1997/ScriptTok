/**
 * Direct Claude AI Model Test
 * Tests the specific bug where scheduled jobs output ChatGPT instead of Claude
 */

async function testClaudeDirectly() {
  console.log("🚨 DIRECT CLAUDE TEST STARTED");
  console.log("=============================");
  
  try {
    // Test scheduled job trigger and check webhook output
    const response = await fetch('http://localhost:5000/api/scheduled-jobs/95/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Scheduled job triggered successfully");
    
    // Wait for execution and check webhook debug data
    setTimeout(async () => {
      try {
        const webhookResponse = await fetch('http://localhost:5000/api/webhook-debug');
        const webhookData = await webhookResponse.json();
        
        console.log("\n🔍 WEBHOOK DEBUG ANALYSIS:");
        console.log("==========================");
        
        if (webhookData.recentPayloads && webhookData.recentPayloads.length > 0) {
          const latestPayload = webhookData.recentPayloads[0];
          console.log(`📋 Latest Webhook Model: ${latestPayload.model || 'NOT SET'}`);
          console.log(`🎯 Expected: Claude`);
          console.log(`❌ Problem: ${latestPayload.model !== 'Claude' ? 'MODEL MISMATCH!' : 'Model correct'}`);
          
          if (latestPayload.model !== 'Claude') {
            console.log("\n🚨 CLAUDE BUG CONFIRMED:");
            console.log("- Database has 'claude' but webhook shows different model");
            console.log("- Issue is in AI model router or content generator");
          } else {
            console.log("\n✅ CLAUDE BUG FIXED:");
            console.log("- Webhook correctly shows Claude model");
          }
        } else {
          console.log("❌ No recent webhook payloads found");
        }
      } catch (error) {
        console.error("Error checking webhook:", error.message);
      }
    }, 10000); // Wait 10 seconds for job execution
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testClaudeDirectly();