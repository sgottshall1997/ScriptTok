/**
 * Comprehensive test suite for global generation gatekeeper and safeguards
 * This test validates that all automated content generation is properly blocked
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  blocked: boolean;
  statusCode: number;
  error?: string;
  reason?: string;
}

async function testEndpoint(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<TestResult> {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'test-suite/1.0'
      }
    };

    const response = await axios(config);
    
    return {
      endpoint,
      method,
      blocked: false,
      statusCode: response.status,
      error: 'Request was allowed when it should have been blocked'
    };
  } catch (error: any) {
    if (error.response?.status === 403) {
      return {
        endpoint,
        method,
        blocked: true,
        statusCode: error.response.status,
        reason: error.response.data?.reason || 'Unknown reason'
      };
    }
    
    return {
      endpoint,
      method,
      blocked: false,
      statusCode: error.response?.status || 500,
      error: error.message || 'Unknown error'
    };
  }
}

export async function runComprehensiveSafeguardTest(): Promise<void> {
  console.log('\n🧪 Starting comprehensive safeguard test...');
  console.log('=' .repeat(80));
  
  const testCases = [
    {
      name: 'Unified Content Generator (Automated)',
      endpoint: '/api/generate-unified',
      method: 'POST' as const,
      data: {
        mode: 'automated',
        productName: 'Test Product',
        niche: 'beauty'
      }
    },
    {
      name: 'Unified Content Generator (Manual)',
      endpoint: '/api/generate-unified',
      method: 'POST' as const,
      data: {
        mode: 'manual',
        productName: 'Test Product',
        niche: 'beauty'
      }
    },
    {
      name: 'Bulk Content Generation',
      endpoint: '/api/bulk/start-generation',
      method: 'POST' as const,
      data: {
        niche: 'beauty',
        tones: ['Enthusiastic'],
        templates: ['Short-Form Video Script']
      }
    },
    {
      name: 'Automated Bulk Generation',
      endpoint: '/api/automated-bulk/start',
      method: 'POST' as const,
      data: {
        selectedNiches: ['beauty'],
        tones: ['Enthusiastic'],
        templates: ['Short-Form Video Script']
      }
    },
    {
      name: 'Daily Batch Generation',
      endpoint: '/api/generate/daily-batch',
      method: 'POST' as const,
      data: {}
    },
    {
      name: 'Legacy Generate Content',
      endpoint: '/api/generate-content',
      method: 'POST' as const,
      data: {
        productName: 'Test Product',
        template: 'Short-Form Video Script',
        tone: 'Enthusiastic',
        niche: 'beauty'
      }
    }
  ];

  const results: TestResult[] = [];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`   Endpoint: ${testCase.method} ${testCase.endpoint}`);
    
    const result = await testEndpoint(testCase.endpoint, testCase.method, testCase.data);
    results.push(result);
    
    if (result.blocked) {
      console.log(`   ✅ BLOCKED (${result.statusCode}): ${result.reason}`);
    } else {
      console.log(`   ❌ NOT BLOCKED (${result.statusCode}): ${result.error || 'Request was allowed'}`);
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(80));
  
  let automatedBlocked = 0;
  let manualAllowed = 0;
  let totalTests = results.length;
  
  results.forEach(result => {
    const isManualRequest = result.endpoint.includes('generate-unified') && 
                           JSON.stringify(result).includes('manual');
    
    if (isManualRequest) {
      if (!result.blocked) {
        manualAllowed++;
      }
    } else {
      if (result.blocked) {
        automatedBlocked++;
      }
    }
  });
  
  console.log(`Total tests: ${totalTests}`);
  console.log(`Automated requests blocked: ${automatedBlocked}/${totalTests - 1}`);
  console.log(`Manual requests allowed: ${manualAllowed}/1`);
  
  const automatedBlockedCorrectly = automatedBlocked === (totalTests - 1);
  const manualAllowedCorrectly = manualAllowed === 1;
  
  console.log('\n🎯 Security Assessment:');
  console.log(`   Automated Generation Protection: ${automatedBlockedCorrectly ? '✅ SECURE' : '❌ VULNERABLE'}`);
  console.log(`   Manual Generation Access: ${manualAllowedCorrectly ? '✅ ACCESSIBLE' : '❌ BLOCKED'}`);
  
  if (automatedBlockedCorrectly && manualAllowedCorrectly) {
    console.log('\n🛡️ SAFEGUARDS WORKING CORRECTLY - System is secure!');
  } else {
    console.log('\n🚨 SAFEGUARDS COMPROMISED - Manual intervention required!');
  }
  
  console.log('=' .repeat(80));
}