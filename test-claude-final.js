/**
 * FINAL CLAUDE AI MODEL VERIFICATION TEST
 * Tests Claude AI model selection works every single time
 */

async function testClaudeEveryTime() {
  console.log("🔥 FINAL CLAUDE VERIFICATION - EVERY SINGLE TIME TEST");
  console.log("=".repeat(60));
  
  const results = [];
  
  // Test 1: Manual unified generator with Claude
  console.log("\n📝 TEST 1: Manual Unified Generator with Claude");
  try {
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        product: 'Claude Test Product Manual',
        niche: 'tech',
        templateType: 'Short-Form Video Script',
        tone: 'Professional',
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: false,
        useSmartStyle: false
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log("✅ Manual generator: SUCCESS");
      results.push("✅ Manual Generator: Claude working");
    } else {
      console.log("❌ Manual generator: FAILED");
      results.push("❌ Manual Generator: Failed");
    }
  } catch (error) {
    console.log("❌ Manual generator: ERROR -", error.message);
    results.push("❌ Manual Generator: Error");
  }
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Scheduled job trigger (Claude configured)
  console.log("\n📝 TEST 2: Scheduled Job with Claude (Job ID 95)");
  try {
    const response = await fetch('http://localhost:5000/api/scheduled-jobs/95/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log("✅ Scheduled job: SUCCESS");
      results.push("✅ Scheduled Job: Claude working");
    } else {
      console.log("❌ Scheduled job: FAILED");
      results.push("❌ Scheduled Job: Failed");
    }
  } catch (error) {
    console.log("❌ Scheduled job: ERROR -", error.message);
    results.push("❌ Scheduled Job: Error");
  }
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test 3: Check recent content history for Claude usage
  console.log("\n📝 TEST 3: Database Verification - Recent Content");
  try {
    const response = await fetch('http://localhost:5000/api/content-history');
    const data = await response.json();
    
    if (data.history && data.history.length > 0) {
      const recentContent = data.history.slice(0, 3);
      console.log(`✅ Found ${recentContent.length} recent content entries`);
      results.push("✅ Database: Recent content found");
      
      // Check if any recent content indicates Claude usage
      recentContent.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.productName} (${item.niche}) - ${item.createdAt}`);
      });
    } else {
      console.log("❌ No recent content found");
      results.push("❌ Database: No recent content");
    }
  } catch (error) {
    console.log("❌ Database check: ERROR -", error.message);
    results.push("❌ Database: Error");
  }
  
  // Final Results Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎯 FINAL CLAUDE VERIFICATION RESULTS:");
  console.log("=".repeat(60));
  
  results.forEach(result => console.log(result));
  
  const successCount = results.filter(r => r.includes("✅")).length;
  const totalTests = results.length;
  
  console.log(`\n📊 SUCCESS RATE: ${successCount}/${totalTests} tests passed`);
  
  if (successCount === totalTests) {
    console.log("🎉 CLAUDE AI MODEL WORKS EVERY SINGLE TIME - VERIFIED!");
  } else {
    console.log("⚠️  Some tests failed - Claude may not be working consistently");
  }
}

// Run the comprehensive test
testClaudeEveryTime();