/**
 * Scheduled Job Debug Monitor
 * Real-time monitoring and testing for scheduled bulk generation
 */

import axios from 'axios';
import { db } from '../db.js';
import { scheduledBulkJobs, bulkContentJobs, bulkGeneratedContent } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const API_BASE = process.env.REPLIT_URL || 'http://localhost:5000';

class ScheduledJobDebugger {
  constructor() {
    this.jobId = 18; // The scheduled job we're monitoring
    this.monitoringActive = false;
  }

  async validateJobConfiguration() {
    console.log('\n🔍 VALIDATING JOB CONFIGURATION...');
    
    try {
      const response = await axios.get(`${API_BASE}/api/scheduled-bulk/jobs`);
      const job = response.data.jobs.find(j => j.id === this.jobId);
      
      if (!job) {
        console.error('❌ Job not found!');
        return false;
      }

      console.log('✅ Job Configuration:');
      console.log(`   Name: ${job.name}`);
      console.log(`   Schedule: ${job.scheduleTime} ${job.timezone}`);
      console.log(`   Next Run: ${job.nextRunAt}`);
      console.log(`   AI Model: ${job.aiModel}`);
      console.log(`   Spartan Format: ${job.useSpartanFormat}`);
      console.log(`   Niches: ${job.selectedNiches.join(', ')}`);
      console.log(`   Platforms: ${job.platforms.join(', ')}`);
      console.log(`   Webhook: ${job.sendToMakeWebhook ? 'Enabled' : 'Disabled'}`);
      console.log(`   Active: ${job.isActive ? 'Yes' : 'No'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to validate job configuration:', error.message);
      return false;
    }
  }

  async testGenerationSafeguards() {
    console.log('\n🛡️ TESTING GENERATION SAFEGUARDS...');
    
    try {
      // Test with scheduled job headers
      const testPayload = {
        selectedNiches: ['tech'],
        tones: ['Enthusiastic'],
        templates: ['short_video'],
        platforms: ['tiktok'],
        useExistingProducts: true,
        generateAffiliateLinks: true,
        useSpartanFormat: true,
        useSmartStyle: false,
        aiModel: 'claude',
        affiliateId: 'sgottshall107-20',
        sendToMakeWebhook: false
      };

      const response = await axios.post(`${API_BASE}/api/generate-unified`, testPayload, {
        headers: {
          'x-generation-source': 'scheduled_job',
          'user-agent': 'scheduled-job-runner'
        }
      });

      if (response.status === 200) {
        console.log('✅ Safeguards: Scheduled job generation is ALLOWED');
        return true;
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.error('❌ Safeguards: Scheduled job generation is BLOCKED');
        console.error(`   Reason: ${error.response.data.reason}`);
      } else {
        console.error('❌ Safeguards test error:', error.message);
      }
      return false;
    }
  }

  async checkProductAvailability() {
    console.log('\n📦 CHECKING PRODUCT AVAILABILITY...');
    
    try {
      const response = await axios.get(`${API_BASE}/api/trending/products`);
      const products = response.data;
      
      const niches = ['beauty', 'fitness', 'tech', 'food', 'fashion', 'pets', 'travel'];
      const nicheProducts = {};
      
      niches.forEach(niche => {
        nicheProducts[niche] = products.filter(p => p.niche === niche).length;
      });
      
      console.log('✅ Products by niche:');
      Object.entries(nicheProducts).forEach(([niche, count]) => {
        console.log(`   ${niche}: ${count} products`);
      });
      
      const hasProducts = Object.values(nicheProducts).every(count => count > 0);
      if (!hasProducts) {
        console.error('❌ Some niches have no products available!');
        return false;
      }
      
      console.log('✅ All niches have products available');
      return true;
    } catch (error) {
      console.error('❌ Failed to check product availability:', error.message);
      return false;
    }
  }

  async testUnifiedGenerator() {
    console.log('\n🧪 TESTING UNIFIED GENERATOR...');
    
    try {
      const testPayload = {
        productName: "Test Product",
        niche: "tech",
        tone: "Enthusiastic",
        template: "short_video",
        platforms: ["tiktok"],
        useSpartanFormat: true,
        useSmartStyle: false,
        aiModel: "claude",
        affiliateId: "sgottshall107-20",
        mode: "manual"
      };

      const response = await axios.post(`${API_BASE}/api/generate-unified`, testPayload, {
        headers: {
          'x-generation-source': 'manual_ui',
          'user-agent': 'debug-test'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ Unified generator is working correctly');
        console.log(`   Generated content for: ${response.data.content?.productName || 'test product'}`);
        return true;
      } else {
        console.error('❌ Unified generator returned error:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Unified generator test failed:', error.message);
      if (error.response?.data) {
        console.error('   Response:', error.response.data);
      }
      return false;
    }
  }

  async monitorExecution() {
    console.log('\n👁️ STARTING EXECUTION MONITORING...');
    console.log('   Monitoring will check for job execution every 10 seconds...');
    
    this.monitoringActive = true;
    const startTime = Date.now();
    let lastJobCount = 0;
    
    while (this.monitoringActive) {
      try {
        // Check for new bulk jobs created by the scheduled job
        const bulkJobs = await db.select()
          .from(bulkContentJobs)
          .where(eq(bulkContentJobs.jobType, 'scheduled'))
          .orderBy(desc(bulkContentJobs.createdAt))
          .limit(5);
        
        if (bulkJobs.length > lastJobCount) {
          console.log(`🎯 NEW BULK JOB DETECTED: ${bulkJobs[0].jobId}`);
          console.log(`   Status: ${bulkJobs[0].status}`);
          console.log(`   Niches: ${bulkJobs[0].selectedNiches?.join(', ') || 'N/A'}`);
          console.log(`   Progress: ${bulkJobs[0].completedVariations}/${bulkJobs[0].totalVariations}`);
          
          // Check for generated content
          const generatedContent = await db.select()
            .from(bulkGeneratedContent)
            .where(eq(bulkGeneratedContent.bulkJobId, bulkJobs[0].jobId))
            .limit(10);
          
          console.log(`   Generated Content: ${generatedContent.length} pieces`);
          
          if (generatedContent.length > 0) {
            console.log('✅ CONTENT GENERATION SUCCESSFUL!');
            generatedContent.forEach((content, index) => {
              console.log(`   ${index + 1}. ${content.productName} (${content.niche})`);
            });
          }
          
          lastJobCount = bulkJobs.length;
        }
        
        // Check execution time
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 300) { // 5 minutes
          console.log('⏰ Monitoring timeout reached (5 minutes)');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async runFullDiagnostic() {
    console.log('🩺 SCHEDULED JOB DIAGNOSTIC STARTING...');
    console.log('================================================');
    
    const tests = [
      { name: 'Job Configuration', test: () => this.validateJobConfiguration() },
      { name: 'Generation Safeguards', test: () => this.testGenerationSafeguards() },
      { name: 'Product Availability', test: () => this.checkProductAvailability() },
      { name: 'Unified Generator', test: () => this.testUnifiedGenerator() }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      const result = await test.test();
      if (!result) {
        allPassed = false;
      }
    }
    
    console.log('\n================================================');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Scheduled job should execute successfully.');
      console.log('   Starting execution monitoring...');
      await this.monitorExecution();
    } else {
      console.log('⚠️ SOME TESTS FAILED! Please review the issues above.');
    }
  }

  stopMonitoring() {
    this.monitoringActive = false;
    console.log('🛑 Monitoring stopped');
  }
}

// Auto-run diagnostic if not in production
if (process.env.NODE_ENV !== 'production') {
  const debugger = new ScheduledJobDebugger();
  
  console.log('\n🚀 SCHEDULED JOB DEBUGGER STARTING...');
  console.log('   This will test all components before the scheduled execution');
  
  // Run diagnostic after server startup
  setTimeout(() => {
    debugger.runFullDiagnostic().catch(error => {
      console.error('❌ Diagnostic failed:', error);
    });
  }, 3000);
  
  // Make debugger available globally for manual control
  global.scheduledJobDebugger = debugger;
  
  console.log('\n💡 Manual controls available:');
  console.log('   - global.scheduledJobDebugger.runFullDiagnostic()');
  console.log('   - global.scheduledJobDebugger.stopMonitoring()');
}

export default ScheduledJobDebugger;