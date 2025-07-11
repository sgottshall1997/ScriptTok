/**
 * Comprehensive Unified Content Generator Test Suite
 * 
 * This comprehensive test validates all model/format combinations
 * and ensures the unified generator works reliably across all scenarios.
 */

import { db } from '../db.js';
import { generateContent } from '../services/contentGenerator';
import { generatePlatformCaptions } from '../services/platformContentGenerator';
import { generateSpartanContent } from '../services/spartanContentGenerator';
import { generateWithAI } from '../services/aiModelRouter';
import { eq, desc } from 'drizzle-orm';
import { trendingProducts, contentHistory } from '@shared/schema';

interface TestResult {
  testCase: string;
  success: boolean;
  productUsed: string;
  scriptLength: number;
  scriptPreview: string;
  modelUsed: 'chatgpt' | 'claude';
  formatUsed: 'spartan' | 'default';
  errors: string[];
  warnings: string[];
  executionTime: number;
}

interface TestConfiguration {
  productName: string;
  niche: string;
  template: string;
  tone: string;
  aiModel: 'chatgpt' | 'claude';
  useSpartanFormat: boolean;
  platforms: string[];
}

class UnifiedGeneratorTester {
  private testResults: TestResult[] = [];
  private errors: string[] = [];
  
  constructor() {
    console.log('🧪 Initializing Unified Content Generator Test Suite');
  }

  /**
   * Run comprehensive test suite covering all model/format combinations
   */
  async runComprehensiveTests(): Promise<{
    summary: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: TestResult[];
    bugsFound: string[];
    bugsFixed: string[];
  }> {
    console.log('🎯 Starting comprehensive unified generator tests...');
    
    // Get test products from database
    const testProducts = await this.getTestProducts();
    
    if (testProducts.length === 0) {
      throw new Error('No trending products available for testing');
    }

    // Test configurations covering all combinations
    const testConfigs: TestConfiguration[] = [
      // Claude + Spartan tests
      {
        productName: testProducts[0].title,
        niche: testProducts[0].niche,
        template: 'Short-Form Video Script',
        tone: 'Professional',
        aiModel: 'claude',
        useSpartanFormat: true,
        platforms: ['tiktok', 'instagram']
      },
      {
        productName: testProducts[1]?.title || testProducts[0].title,
        niche: testProducts[1]?.niche || testProducts[0].niche,
        template: 'Product Review',
        tone: 'Conversational',
        aiModel: 'claude',
        useSpartanFormat: true,
        platforms: ['youtube', 'twitter']
      },
      
      // Claude + Default tests
      {
        productName: testProducts[2]?.title || testProducts[0].title,
        niche: testProducts[2]?.niche || testProducts[0].niche,
        template: 'Unboxing Experience',
        tone: 'Enthusiastic',
        aiModel: 'claude',
        useSpartanFormat: false,
        platforms: ['tiktok', 'instagram', 'youtube']
      },
      {
        productName: testProducts[3]?.title || testProducts[0].title,
        niche: testProducts[3]?.niche || testProducts[0].niche,
        template: 'Expert Review',
        tone: 'Informative',
        aiModel: 'claude',
        useSpartanFormat: false,
        platforms: ['youtube', 'twitter', 'other']
      },
      
      // GPT + Spartan tests
      {
        productName: testProducts[4]?.title || testProducts[0].title,
        niche: testProducts[4]?.niche || testProducts[0].niche,
        template: 'Short-Form Video Script',
        tone: 'Professional',
        aiModel: 'chatgpt',
        useSpartanFormat: true,
        platforms: ['tiktok', 'instagram']
      },
      {
        productName: testProducts[5]?.title || testProducts[0].title,
        niche: testProducts[5]?.niche || testProducts[0].niche,
        template: 'Product Comparison',
        tone: 'Analytical',
        aiModel: 'chatgpt',
        useSpartanFormat: true,
        platforms: ['youtube', 'other']
      },
      
      // GPT + Default tests
      {
        productName: testProducts[6]?.title || testProducts[0].title,
        niche: testProducts[6]?.niche || testProducts[0].niche,
        template: 'Viral Hook Generator',
        tone: 'Enthusiastic',
        aiModel: 'chatgpt',
        useSpartanFormat: false,
        platforms: ['tiktok', 'instagram', 'youtube', 'twitter']
      },
      {
        productName: testProducts[0].title,
        niche: testProducts[0].niche,
        template: 'Problem-Solution',
        tone: 'Friendly',
        aiModel: 'chatgpt',
        useSpartanFormat: false,
        platforms: ['instagram', 'youtube', 'other']
      }
    ];

    // Run individual tests
    for (let i = 0; i < testConfigs.length; i++) {
      const config = testConfigs[i];
      console.log(`\n🔍 Running test ${i + 1}/${testConfigs.length}: ${config.aiModel.toUpperCase()} + ${config.useSpartanFormat ? 'Spartan' : 'Default'}`);
      
      try {
        const result = await this.runSingleTest(config, `Test ${i + 1}`);
        this.testResults.push(result);
      } catch (error) {
        console.error(`❌ Test ${i + 1} failed with error:`, error);
        this.testResults.push({
          testCase: `Test ${i + 1}`,
          success: false,
          productUsed: config.productName,
          scriptLength: 0,
          scriptPreview: '',
          modelUsed: config.aiModel,
          formatUsed: config.useSpartanFormat ? 'spartan' : 'default',
          errors: [error.message || 'Unknown error'],
          warnings: [],
          executionTime: 0
        });
      }
    }

    // Analyze results and generate summary
    return this.generateTestSummary();
  }

  /**
   * Run a single test configuration
   */
  private async runSingleTest(config: TestConfiguration, testName: string): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(`  📋 Testing: ${config.productName} (${config.niche})`);
      console.log(`  🤖 Model: ${config.aiModel} | Format: ${config.useSpartanFormat ? 'Spartan' : 'Default'}`);

      // Step 1: Test content generation
      let generatedContent: any;
      
      // Use the unified generator API for consistent testing
      const testUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/generate-unified`;
      const testPayload = {
        mode: 'manual',
        data: {
          productName: config.productName,
          niche: config.niche,
          templateType: config.template,
          tone: config.tone,
          platforms: config.platforms,
          contentType: 'video',
          aiModel: config.aiModel,
          useSpartanFormat: config.useSpartanFormat,
          useSmartStyle: false,
          customHook: '',
          affiliateId: 'test123-20'
        }
      };
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Generation failed: ${result.error}`);
      }
      
      // Extract the generated content from the API response
      generatedContent = result.data.results[0] || null;

      // Step 2: Validate script content
      if (!generatedContent || (!generatedContent.script && !generatedContent.content)) {
        errors.push('Generated content is missing or has no script field');
        throw new Error('No script generated');
      }

      const script = (generatedContent.script || generatedContent.content || '').trim();
      if (script.length === 0) {
        errors.push('Generated script is empty');
        throw new Error('Empty script generated');
      }

      if (script.length < 10) {
        warnings.push(`Script is very short (${script.length} characters)`);
      }

      // Step 3: Validate Spartan format requirements
      if (config.useSpartanFormat) {
        this.validateSpartanFormat(script, errors, warnings);
      }

      // Step 4: Validate platform captions from unified generator response
      if (generatedContent.platformCaptions) {
        const platformCaptions = generatedContent.platformCaptions;
        if (!platformCaptions || Object.keys(platformCaptions).length === 0) {
          warnings.push('No platform captions were generated');
        } else {
          // Validate that each requested platform has a caption
          for (const platform of config.platforms) {
            if (!platformCaptions[platform]) {
              warnings.push(`Missing caption for platform: ${platform}`);
            }
          }
        }
      } else {
        warnings.push('Platform captions not included in response');
      }

      // Step 5: Validate product association
      if (!script.toLowerCase().includes(config.productName.toLowerCase().split(' ')[0])) {
        warnings.push('Generated script may not reference the specified product');
      }

      const executionTime = Date.now() - startTime;
      const success = errors.length === 0;

      console.log(`  ${success ? '✅' : '❌'} Test completed in ${executionTime}ms`);
      console.log(`  📝 Script preview: "${script.substring(0, 100)}..."`);

      return {
        testCase: testName,
        success,
        productUsed: config.productName,
        scriptLength: script.length,
        scriptPreview: script.substring(0, 150),
        modelUsed: config.aiModel,
        formatUsed: config.useSpartanFormat ? 'spartan' : 'default',
        errors,
        warnings,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      errors.push(error.message || 'Unknown error during test execution');
      
      return {
        testCase: testName,
        success: false,
        productUsed: config.productName,
        scriptLength: 0,
        scriptPreview: '',
        modelUsed: config.aiModel,
        formatUsed: config.useSpartanFormat ? 'spartan' : 'default',
        errors,
        warnings,
        executionTime
      };
    }
  }

  /**
   * Validate Spartan format requirements
   */
  private validateSpartanFormat(script: string, errors: string[], warnings: string[]): void {
    // Check for banned words in Spartan format
    const bannedWords = ['can', 'may', 'just', 'that', 'very', 'really', 'literally', 'actually'];
    const foundBannedWords = bannedWords.filter(word => 
      script.toLowerCase().includes(word.toLowerCase())
    );
    
    if (foundBannedWords.length > 0) {
      warnings.push(`Spartan format violation: Found banned words: ${foundBannedWords.join(', ')}`);
    }

    // Check for emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
    if (emojiRegex.test(script)) {
      warnings.push('Spartan format violation: Script contains emojis');
    }

    // Check length limits for Spartan format
    if (script.length > 120 * 6) { // Rough word count estimation
      warnings.push(`Spartan script may exceed 120 word limit (${script.length} characters)`);
    }
  }

  /**
   * Get test products from database
   */
  private async getTestProducts(): Promise<any[]> {
    try {
      const products = await db
        .select()
        .from(trendingProducts)
        .orderBy(desc(trendingProducts.createdAt))
        .limit(10);
      
      console.log(`📦 Found ${products.length} test products in database`);
      return products;
    } catch (error) {
      console.error('Failed to fetch test products:', error);
      // Return fallback test products
      return [
        { title: 'Test Product 1', niche: 'beauty' },
        { title: 'Test Product 2', niche: 'tech' },
        { title: 'Test Product 3', niche: 'fitness' }
      ];
    }
  }

  /**
   * Generate comprehensive test summary
   */
  private generateTestSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    const bugsFound: string[] = [];
    const bugsFixed: string[] = [];

    // Analyze test results for patterns
    this.testResults.forEach(result => {
      if (!result.success) {
        result.errors.forEach(error => {
          if (!bugsFound.includes(error)) {
            bugsFound.push(error);
          }
        });
      }
    });

    // Generate detailed markdown summary
    const summary = this.generateMarkdownSummary(totalTests, passedTests, failedTests);

    return {
      summary,
      totalTests,
      passedTests,
      failedTests,
      results: this.testResults,
      bugsFound,
      bugsFixed
    };
  }

  /**
   * Generate markdown summary report
   */
  private generateMarkdownSummary(total: number, passed: number, failed: number): string {
    return `# 🧪 Unified Content Generator Test Results

## Executive Summary
- **Total Tests**: ${total}
- **Passed**: ${passed} ✅
- **Failed**: ${failed} ❌
- **Success Rate**: ${((passed / total) * 100).toFixed(1)}%

## Test Results by Configuration

${this.testResults.map((result, index) => `
### Test ${index + 1}: ${result.modelUsed.toUpperCase()} + ${result.formatUsed.charAt(0).toUpperCase() + result.formatUsed.slice(1)} Format
- **Status**: ${result.success ? '✅ PASSED' : '❌ FAILED'}
- **Product**: ${result.productUsed}
- **Script Length**: ${result.scriptLength} characters
- **Execution Time**: ${result.executionTime}ms
- **Script Preview**: "${result.scriptPreview}..."

${result.errors.length > 0 ? `**Errors**:
${result.errors.map(e => `- ❌ ${e}`).join('\n')}` : ''}

${result.warnings.length > 0 ? `**Warnings**:
${result.warnings.map(w => `- ⚠️ ${w}`).join('\n')}` : ''}
`).join('\n')}

## Issues Analysis
${this.analyzeIssuePatterns()}

## Recommendations
${this.generateRecommendations()}
`;
  }

  /**
   * Analyze patterns in test failures
   */
  private analyzeIssuePatterns(): string {
    const errorsByType: { [key: string]: number } = {};
    const errorsByModel: { [key: string]: number } = {};
    const errorsByFormat: { [key: string]: number } = {};

    this.testResults.forEach(result => {
      if (!result.success) {
        errorsByModel[result.modelUsed] = (errorsByModel[result.modelUsed] || 0) + 1;
        errorsByFormat[result.formatUsed] = (errorsByFormat[result.formatUsed] || 0) + 1;
        
        result.errors.forEach(error => {
          errorsByType[error] = (errorsByType[error] || 0) + 1;
        });
      }
    });

    let analysis = '';
    
    if (Object.keys(errorsByModel).length > 0) {
      analysis += `**Errors by AI Model**:\n${Object.entries(errorsByModel)
        .map(([model, count]) => `- ${model}: ${count} failures`)
        .join('\n')}\n\n`;
    }

    if (Object.keys(errorsByFormat).length > 0) {
      analysis += `**Errors by Format**:\n${Object.entries(errorsByFormat)
        .map(([format, count]) => `- ${format}: ${count} failures`)
        .join('\n')}\n\n`;
    }

    if (Object.keys(errorsByType).length > 0) {
      analysis += `**Most Common Issues**:\n${Object.entries(errorsByType)
        .sort(([,a], [,b]) => b - a)
        .map(([error, count]) => `- ${error} (${count} occurrences)`)
        .join('\n')}`;
    }

    return analysis || 'No significant patterns detected in failures.';
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(): string {
    const recommendations: string[] = [];
    
    const failedTests = this.testResults.filter(r => !r.success);
    const claudeFailures = failedTests.filter(r => r.modelUsed === 'claude').length;
    const spartanFailures = failedTests.filter(r => r.formatUsed === 'spartan').length;
    
    if (claudeFailures > 0) {
      recommendations.push('🔧 **Claude Model Issues**: Review Claude integration and error handling');
    }
    
    if (spartanFailures > 0) {
      recommendations.push('🔧 **Spartan Format Issues**: Validate Spartan content generation pipeline');
    }
    
    const emptyScriptErrors = failedTests.filter(r => 
      r.errors.some(e => e.includes('empty') || e.includes('missing'))
    ).length;
    
    if (emptyScriptErrors > 0) {
      recommendations.push('🔧 **Content Validation**: Implement stricter pre-validation checks for generated content');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ **All Systems Operational**: No critical issues detected in unified generator');
    }
    
    return recommendations.join('\n');
  }
}

export { UnifiedGeneratorTester };