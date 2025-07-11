/**
 * Production-Ready Unified Content Generator Test Suite
 * 
 * This test suite validates the unified content generator across all scenarios
 * required for production deployment.
 */

import { db } from '../db.js';
import { eq, desc } from 'drizzle-orm';
import { trendingProducts } from '@shared/schema';

interface TestResult {
  testCase: string;
  success: boolean;
  productUsed: string;
  scriptLength: number;
  scriptPreview: string;
  modelUsed: 'chatgpt' | 'claude';
  formatUsed: 'spartan' | 'default';
  platformCaptionsGenerated: number;
  errors: string[];
  warnings: string[];
  executionTime: number;
  webhookDelivered: boolean;
  dbEntrySaved: boolean;
  aiEvaluationCompleted: boolean;
}

export async function runProductionReadyTests(): Promise<{
  summary: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  recommendations: string[];
}> {
  console.log('🧪 Running Production-Ready Test Suite for Unified Content Generator');
  const results: TestResult[] = [];
  
  // Get test products
  const testProducts = await db.select().from(trendingProducts).limit(8);
  
  if (testProducts.length === 0) {
    throw new Error('No test products available');
  }
  
  // Test configurations covering all critical scenarios
  const testConfigs = [
    { product: testProducts[0], aiModel: 'chatgpt' as const, useSpartanFormat: false, platforms: ['tiktok', 'instagram'] },
    { product: testProducts[1], aiModel: 'chatgpt' as const, useSpartanFormat: true, platforms: ['youtube', 'twitter'] },
    { product: testProducts[2], aiModel: 'claude' as const, useSpartanFormat: false, platforms: ['tiktok', 'instagram', 'youtube'] },
    { product: testProducts[3], aiModel: 'claude' as const, useSpartanFormat: true, platforms: ['twitter', 'other'] },
    { product: testProducts[4], aiModel: 'chatgpt' as const, useSpartanFormat: false, platforms: ['instagram', 'youtube'] },
    { product: testProducts[5], aiModel: 'chatgpt' as const, useSpartanFormat: true, platforms: ['tiktok', 'other'] },
    { product: testProducts[6], aiModel: 'claude' as const, useSpartanFormat: false, platforms: ['twitter', 'instagram'] },
    { product: testProducts[7], aiModel: 'claude' as const, useSpartanFormat: true, platforms: ['youtube', 'tiktok'] },
  ];
  
  for (let i = 0; i < testConfigs.length; i++) {
    const config = testConfigs[i];
    console.log(`\n🔍 Running test ${i + 1}/8: ${config.aiModel.toUpperCase()} + ${config.useSpartanFormat ? 'Spartan' : 'Default'}`);
    
    const result = await runSingleProductionTest(config, i + 1);
    results.push(result);
  }
  
  // Generate summary
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.length - passedTests;
  
  const summary = generateTestSummary(results);
  const recommendations = generateRecommendations(results);
  
  return {
    summary,
    totalTests: results.length,
    passedTests,
    failedTests,
    results,
    recommendations
  };
}

async function runSingleProductionTest(config: any, testNumber: number): Promise<TestResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    console.log(`  📋 Testing: ${config.product.title} (${config.product.niche})`);
    console.log(`  🤖 Model: ${config.aiModel} | Format: ${config.useSpartanFormat ? 'Spartan' : 'Default'}`);
    
    // Test payload for unified generator
    const testPayload = {
      mode: 'manual',
      productName: config.product.title,
      niche: config.product.niche,
      template: 'original',
      tone: 'enthusiastic',
      platforms: config.platforms,
      contentType: 'video',
      aiModel: config.aiModel,
      useSpartanFormat: config.useSpartanFormat,
      useSmartStyle: false,
      customHook: '',
      affiliateId: 'test123-20'
    };
    
    // Call unified generator API
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    const executionTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      errors.push(`API call failed with status ${response.status}: ${errorText}`);
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      errors.push(`Generation failed: ${result.error}`);
      throw new Error(`Generation failed: ${result.error}`);
    }
    
    const generatedContent = result.data.results[0];
    
    if (!generatedContent) {
      errors.push('No content generated');
      throw new Error('No content generated');
    }
    
    // Validate script content
    const script = generatedContent.script || generatedContent.content || '';
    if (script.trim().length === 0) {
      errors.push('Generated script is empty');
      throw new Error('Empty script generated');
    }
    
    if (script.length < 10) {
      warnings.push(`Script is very short (${script.length} characters)`);
    }
    
    // Validate platform captions
    const platformCaptions = generatedContent.platformCaptions || {};
    const platformCount = Object.keys(platformCaptions).length;
    
    if (platformCount === 0) {
      warnings.push('No platform captions generated');
    } else if (platformCount < config.platforms.length) {
      warnings.push(`Missing platform captions: expected ${config.platforms.length}, got ${platformCount}`);
    }
    
    // Validate Spartan format compliance
    if (config.useSpartanFormat) {
      const bannedWords = ['can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually'];
      const foundBannedWords = bannedWords.filter(word => script.toLowerCase().includes(word));
      
      if (foundBannedWords.length > 0) {
        warnings.push(`Spartan format violation: Contains banned words: ${foundBannedWords.join(', ')}`);
      }
      
      // Check for emojis in Spartan format
      const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      if (emojiPattern.test(script)) {
        warnings.push('Spartan format violation: Script contains emojis');
      }
    }
    
    // Validate product reference
    const productWords = config.product.title.toLowerCase().split(' ').filter(word => word.length > 2);
    const hasProductReference = productWords.some(word => script.toLowerCase().includes(word));
    
    if (!hasProductReference) {
      warnings.push('Script may not reference the specified product');
    }
    
    // Check for webhook delivery (simulated)
    let webhookDelivered = false;
    if (result.data.webhookDelivered || result.data.webhookSent) {
      webhookDelivered = true;
    }
    
    // Check for database entry (simulated)
    let dbEntrySaved = false;
    if (result.data.contentId || result.data.saved) {
      dbEntrySaved = true;
    }
    
    // Check for AI evaluation (simulated)
    let aiEvaluationCompleted = false;
    if (result.data.aiEvaluation || result.data.evaluation) {
      aiEvaluationCompleted = true;
    }
    
    const success = errors.length === 0;
    
    console.log(`  ${success ? '✅' : '❌'} Test completed in ${executionTime}ms`);
    console.log(`  📝 Script: ${script.substring(0, 50)}...`);
    console.log(`  🎯 Platforms: ${platformCount}/${config.platforms.length}`);
    
    return {
      testCase: `Test ${testNumber}: ${config.aiModel.toUpperCase()} + ${config.useSpartanFormat ? 'Spartan' : 'Default'}`,
      success,
      productUsed: config.product.title,
      scriptLength: script.length,
      scriptPreview: script.substring(0, 100),
      modelUsed: config.aiModel,
      formatUsed: config.useSpartanFormat ? 'spartan' : 'default',
      platformCaptionsGenerated: platformCount,
      errors,
      warnings,
      executionTime,
      webhookDelivered,
      dbEntrySaved,
      aiEvaluationCompleted
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    errors.push(error.message || 'Unknown error during test execution');
    
    return {
      testCase: `Test ${testNumber}: ${config.aiModel.toUpperCase()} + ${config.useSpartanFormat ? 'Spartan' : 'Default'}`,
      success: false,
      productUsed: config.product.title,
      scriptLength: 0,
      scriptPreview: '',
      modelUsed: config.aiModel,
      formatUsed: config.useSpartanFormat ? 'spartan' : 'default',
      platformCaptionsGenerated: 0,
      errors,
      warnings,
      executionTime,
      webhookDelivered: false,
      dbEntrySaved: false,
      aiEvaluationCompleted: false
    };
  }
}

function generateTestSummary(results: TestResult[]): string {
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = total - passed;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  let summary = `# 🧪 Production-Ready Test Results\n\n`;
  summary += `## Executive Summary\n`;
  summary += `- **Total Tests**: ${total}\n`;
  summary += `- **Passed**: ${passed} ✅\n`;
  summary += `- **Failed**: ${failed} ❌\n`;
  summary += `- **Success Rate**: ${successRate}%\n\n`;
  
  summary += `## Test Results by Configuration\n`;
  
  results.forEach((result, index) => {
    summary += `### ${result.testCase}\n`;
    summary += `- **Status**: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `- **Product**: ${result.productUsed}\n`;
    summary += `- **Script Length**: ${result.scriptLength} characters\n`;
    summary += `- **Platform Captions**: ${result.platformCaptionsGenerated}\n`;
    summary += `- **Execution Time**: ${result.executionTime}ms\n`;
    summary += `- **Script Preview**: "${result.scriptPreview}..."\n`;
    
    if (result.errors.length > 0) {
      summary += `**Errors**:\n`;
      result.errors.forEach(error => summary += `- ❌ ${error}\n`);
    }
    
    if (result.warnings.length > 0) {
      summary += `**Warnings**:\n`;
      result.warnings.forEach(warning => summary += `- ⚠️ ${warning}\n`);
    }
    
    summary += `\n`;
  });
  
  return summary;
}

function generateRecommendations(results: TestResult[]): string[] {
  const recommendations: string[] = [];
  
  const failedResults = results.filter(r => !r.success);
  const modelFailures = failedResults.reduce((acc, r) => {
    acc[r.modelUsed] = (acc[r.modelUsed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const formatFailures = failedResults.reduce((acc, r) => {
    acc[r.formatUsed] = (acc[r.formatUsed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (modelFailures.chatgpt > 0) {
    recommendations.push(`🔧 **ChatGPT Model Issues**: ${modelFailures.chatgpt} failures detected. Review ChatGPT integration and error handling.`);
  }
  
  if (modelFailures.claude > 0) {
    recommendations.push(`🔧 **Claude Model Issues**: ${modelFailures.claude} failures detected. Review Claude integration and error handling.`);
  }
  
  if (formatFailures.spartan > 0) {
    recommendations.push(`🔧 **Spartan Format Issues**: ${formatFailures.spartan} failures detected. Validate Spartan content generation pipeline.`);
  }
  
  if (formatFailures.default > 0) {
    recommendations.push(`🔧 **Default Format Issues**: ${formatFailures.default} failures detected. Review standard content generation workflow.`);
  }
  
  const allErrors = failedResults.flatMap(r => r.errors);
  const commonErrors = allErrors.reduce((acc, error) => {
    acc[error] = (acc[error] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonError = Object.entries(commonErrors).sort(([,a], [,b]) => b - a)[0];
  if (mostCommonError) {
    recommendations.push(`🔧 **Most Common Issue**: "${mostCommonError[0]}" (${mostCommonError[1]} occurrences)`);
  }
  
  const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
  if (avgExecutionTime > 10000) {
    recommendations.push(`⚡ **Performance**: Average execution time is ${avgExecutionTime.toFixed(0)}ms. Consider optimization.`);
  }
  
  return recommendations;
}

// Export removed to avoid duplication - function is already exported at declaration