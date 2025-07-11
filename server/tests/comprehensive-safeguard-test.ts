/**
 * 🧪 COMPREHENSIVE SAFEGUARD TEST SUITE
 * Tests all generation endpoints to ensure proper blocking of automated triggers
 */

export async function runComprehensiveSafeguardTest(): Promise<{
  passed: boolean;
  results: Array<{
    endpoint: string;
    source: string;
    blocked: boolean;
    response: any;
    expected: 'block' | 'allow';
    passed: boolean;
  }>;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
  };
}> {
  console.log('\n🧪 STARTING COMPREHENSIVE SAFEGUARD TEST');
  console.log('=' .repeat(60));
  
  const results: any[] = [];
  let passedCount = 0;
  
  const baseUrl = 'http://localhost:5000';
  
  // Test configurations: [endpoint, method, body, headers, expected, description]
  const testCases = [
    // 1. Manual UI requests (should be ALLOWED)
    {
      endpoint: '/api/generate-unified',
      method: 'POST',
      body: {
        mode: 'manual',
        product: 'Test Product',
        niche: 'beauty',
        template: 'Product Review',
        tone: 'Friendly',
        platforms: ['tiktok'],
        aiModel: 'claude',
        useSpartanFormat: false
      },
      headers: {
        'referer': 'http://localhost:5000/unified-generator',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      expected: 'allow',
      source: 'manual_ui',
      description: 'Manual UI content generation'
    },
    
    // 2. Automated bulk generation (should be BLOCKED)
    {
      endpoint: '/api/automated-bulk/start',
      method: 'POST',
      body: {
        selectedNiches: ['beauty'],
        tones: ['Friendly'],
        templates: ['Product Review'],
        platforms: ['tiktok']
      },
      headers: {
        'x-generation-source': 'scheduled_job',
        'user-agent': 'node-cron/1.0'
      },
      expected: 'block',
      source: 'scheduled_job',
      description: 'Scheduled automated bulk generation'
    },
    
    // 3. Webhook triggered generation (should be BLOCKED)
    {
      endpoint: '/api/generate-unified',
      method: 'POST',
      body: {
        mode: 'automated',
        product: 'Webhook Product',
        niche: 'tech'
      },
      headers: {
        'x-generation-source': 'webhook',
        'user-agent': 'webhook-trigger/1.0'
      },
      expected: 'block',
      source: 'webhook_trigger',
      description: 'Webhook triggered generation'
    },
    
    // 4. Cron job generation (should be BLOCKED)
    {
      endpoint: '/api/generate-unified',
      method: 'POST',
      body: {
        mode: 'automated',
        product: 'Cron Product',
        niche: 'fitness'
      },
      headers: {
        'x-generation-source': 'cron',
        'user-agent': 'node-cron/2.0'
      },
      expected: 'block',
      source: 'cron_job',
      description: 'Cron job triggered generation'
    },
    
    // 5. Unknown source (should be BLOCKED)
    {
      endpoint: '/api/generate-unified',
      method: 'POST',
      body: {
        mode: 'manual',
        product: 'Unknown Source Product',
        niche: 'food'
      },
      headers: {
        'user-agent': 'suspicious-bot/1.0'
      },
      expected: 'block',
      source: 'unknown',
      description: 'Unknown source generation'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔬 Testing: ${testCase.description}`);
      console.log(`   Endpoint: ${testCase.endpoint}`);
      console.log(`   Source: ${testCase.source}`);
      console.log(`   Expected: ${testCase.expected}`);
      
      const response = await fetch(`${baseUrl}${testCase.endpoint}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          ...testCase.headers
        },
        body: JSON.stringify(testCase.body)
      });
      
      const responseData = await response.json();
      const wasBlocked = response.status === 403;
      
      const testPassed = (testCase.expected === 'block' && wasBlocked) || 
                        (testCase.expected === 'allow' && !wasBlocked);
      
      if (testPassed) {
        passedCount++;
        console.log(`   ✅ PASSED: ${wasBlocked ? 'Correctly blocked' : 'Correctly allowed'}`);
      } else {
        console.log(`   ❌ FAILED: Expected ${testCase.expected}, got ${wasBlocked ? 'blocked' : 'allowed'}`);
      }
      
      results.push({
        endpoint: testCase.endpoint,
        source: testCase.source,
        blocked: wasBlocked,
        response: responseData,
        expected: testCase.expected,
        passed: testPassed,
        description: testCase.description
      });
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.push({
        endpoint: testCase.endpoint,
        source: testCase.source,
        blocked: false,
        response: { error: error.message },
        expected: testCase.expected,
        passed: false,
        description: testCase.description
      });
    }
  }
  
  const summary = {
    totalTests: testCases.length,
    passed: passedCount,
    failed: testCases.length - passedCount
  };
  
  console.log('\n📊 SAFEGUARD TEST SUMMARY');
  console.log('=' .repeat(40));
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Success Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
  
  const overallPassed = summary.failed === 0;
  console.log(`\n🎯 OVERALL RESULT: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return {
    passed: overallPassed,
    results,
    summary
  };
}

export async function runWatchdogMonitor(durationMinutes: number = 120): Promise<{
  unauthorizedAttempts: number;
  totalAttempts: number;
  log: any[];
}> {
  console.log(`\n🐕 STARTING WATCHDOG MONITOR (${durationMinutes} minutes)`);
  console.log('Will monitor for unauthorized content generation attempts...');
  
  const startTime = Date.now();
  const endTime = startTime + (durationMinutes * 60 * 1000);
  
  let checkCount = 0;
  const monitoringInterval = 30000; // Check every 30 seconds
  
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      checkCount++;
      const now = Date.now();
      
      if (now >= endTime) {
        clearInterval(interval);
        
        try {
          // Get final log from safeguard system
          const response = await fetch('http://localhost:5000/api/safeguards/log');
          const logData = await response.json();
          
          const unauthorizedAttempts = logData.log.filter((entry: any) => 
            !entry.allowed && entry.source !== 'manual_ui'
          ).length;
          
          console.log(`\n🏁 WATCHDOG MONITOR COMPLETE`);
          console.log(`Duration: ${durationMinutes} minutes`);
          console.log(`Checks performed: ${checkCount}`);
          console.log(`Unauthorized attempts detected: ${unauthorizedAttempts}`);
          console.log(`Total generation attempts: ${logData.log.length}`);
          
          resolve({
            unauthorizedAttempts,
            totalAttempts: logData.log.length,
            log: logData.log
          });
        } catch (error) {
          console.error('Error getting final watchdog log:', error);
          resolve({
            unauthorizedAttempts: -1,
            totalAttempts: -1,
            log: []
          });
        }
      } else {
        const remaining = Math.ceil((endTime - now) / 60000);
        console.log(`🐕 Watchdog check ${checkCount} - ${remaining} minutes remaining`);
      }
    }, monitoringInterval);
  });
}