
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to completely delete (Amazon-specific functionality)
const filesToDelete = [
  // Amazon service files
  'server/services/amazon/client.ts',
  'server/services/amazon/normalize.ts', 
  'server/services/amazon/signing.ts',
  'server/services/amazonAffiliate.ts',
  'server/services/affiliateLinkInjector.ts',
  
  // Amazon scrapers
  'server/scrapers/amazon.ts',
  'server/scrapers/amazonApi.ts', 
  'server/scrapers/amazonBeauty.ts',
  
  // Amazon UI components
  'client/src/components/monetization/AmazonMonetizationSettings.tsx',
  'client/src/components/monetization/AutoAffiliateInsertion.tsx',
  'client/src/components/monetization/ProductPicksPanel.tsx',
  'client/src/components/AmazonAssociatesDisclosure.tsx',
  'client/src/pages/AffiliateLinks.tsx',
  
  // Amazon directories
  'server/services/amazon',
  'client/src/components/monetization'
];

// Code patterns to remove from files
const codePatterns = [
  {
    file: 'shared/schema.ts',
    patterns: [
      /\/\/ Amazon monetization tables[\s\S]*?(?=\/\/[^\/]|export|$)/g,
      /export const amazonProducts[\s\S]*?;/g,
      /export const affiliateLinks[\s\S]*?;/g,
      /export const revenueTracking[\s\S]*?;/g,
      /export const productPerformance[\s\S]*?;/g,
      /export const productRecommendations[\s\S]*?;/g,
      /export const complianceDisclosures[\s\S]*?;/g,
      /export const productPriceHistory[\s\S]*?;/g,
      /export const productOpportunities[\s\S]*?;/g,
      /\/\/ Zod schemas for Amazon[\s\S]*?(?=\/\/[^\/]|export|$)/g,
      /export const insertAmazonProduct[\s\S]*?;/g,
      /export const insertAffiliateLink[\s\S]*?;/g,
      /export type AmazonProduct[\s\S]*?;/g,
      /export type InsertAmazonProduct[\s\S]*?;/g,
      /export type AffiliateLink[\s\S]*?;/g
    ]
  },
  {
    file: 'server/env.ts',
    patterns: [
      /\/\/ Amazon PA-API configuration[\s\S]*?(?=\/\/[^\/]|export|$)/g,
      /export const getAmazonConfig[\s\S]*?};/g,
      /\/\/ Monetization configuration[\s\S]*?(?=\/\/[^\/]|export|$)/g,
      /export const getMonetizationConfig[\s\S]*?};/g
    ]
  },
  {
    file: 'server/routes.ts',
    patterns: [
      /\/\/ Amazon affiliate routes[\s\S]*?(?=\/\/[^\/]|app\.|$)/g,
      /app\.get\('\/api\/amazon[\s\S]*?\);/g,
      /app\.post\('\/api\/amazon[\s\S]*?\);/g,
      /app\.get\('\/api\/affiliate[\s\S]*?\);/g
    ]
  }
];

// Import statements to remove
const importsToRemove = [
  'import.*amazon.*from.*',
  'import.*affiliate.*from.*', 
  'import.*monetization.*from.*',
  'import.*AmazonMonetizationSettings.*from.*',
  'import.*ProductPicksPanel.*from.*',
  'import.*AutoAffiliateInsertion.*from.*',
  'import.*AmazonAssociatesDisclosure.*from.*'
];

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`✅ Deleted directory: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message);
  }
}

function cleanFileContent(filePath, patterns) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Remove Amazon-related imports
    importsToRemove.forEach(importPattern => {
      const regex = new RegExp(importPattern + '.*\n', 'g');
      const newContent = content.replace(regex, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Clean up extra whitespace
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned content in: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

function findAndRemoveAmazonReferences() {
  const directoriesToSearch = [
    'client/src',
    'server',
    'shared'
  ];
  
  directoriesToSearch.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    function searchDirectory(dirPath) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.lstatSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules')) {
          searchDirectory(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for Amazon references
            const amazonRefs = [
              /amazon/gi,
              /affiliate/gi,
              /monetization/gi,
              /ProductPicksPanel/gi,
              /AmazonMonetizationSettings/gi,
              /AutoAffiliateInsertion/gi
            ];
            
            let hasAmazonRefs = false;
            amazonRefs.forEach(regex => {
              if (regex.test(content)) {
                hasAmazonRefs = true;
              }
            });
            
            if (hasAmazonRefs) {
              console.log(`🔍 Found Amazon references in: ${fullPath}`);
              
              // Remove Amazon imports and unused code
              let newContent = content;
              
              // Remove Amazon imports
              newContent = newContent.replace(/import.*amazon.*from.*['"][^'"]*['"];?\n/gi, '');
              newContent = newContent.replace(/import.*affiliate.*from.*['"][^'"]*['"];?\n/gi, '');
              newContent = newContent.replace(/import.*monetization.*from.*['"][^'"]*['"];?\n/gi, '');
              
              // Remove Amazon component usage
              newContent = newContent.replace(/<AmazonMonetizationSettings[^>]*\/?>[\s\S]*?<\/AmazonMonetizationSettings>/g, '');
              newContent = newContent.replace(/<ProductPicksPanel[^>]*\/?>[\s\S]*?<\/ProductPicksPanel>/g, '');
              newContent = newContent.replace(/<AutoAffiliateInsertion[^>]*\/?>[\s\S]*?<\/AutoAffiliateInsertion>/g, '');
              newContent = newContent.replace(/<AmazonAssociatesDisclosure[^>]*\/?>[\s\S]*?<\/AmazonAssociatesDisclosure>/g, '');
              
              // Clean up whitespace
              newContent = newContent.replace(/\n\n\n+/g, '\n\n');
              
              if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`✅ Cleaned Amazon references from: ${fullPath}`);
              }
            }
          } catch (error) {
            console.error(`❌ Error processing ${fullPath}:`, error.message);
          }
        }
      });
    }
    
    searchDirectory(dir);
  });
}

// Main cleanup execution
console.log('🧹 Starting Amazon code cleanup...\n');

console.log('📁 Deleting Amazon-specific files and directories...');
filesToDelete.forEach(deleteFile);

console.log('\n📝 Cleaning code patterns from specific files...');
codePatterns.forEach(({ file, patterns }) => {
  cleanFileContent(file, patterns);
});

console.log('\n🔍 Searching for and removing remaining Amazon references...');
findAndRemoveAmazonReferences();

console.log('\n✨ Amazon code cleanup completed!');
console.log('\n📋 Summary of actions taken:');
console.log('   • Deleted Amazon service files and components');
console.log('   • Removed Amazon database schemas');
console.log('   • Cleaned up Amazon imports and references');
console.log('   • Removed unused monetization code');
console.log('\n💡 Next steps:');
console.log('   • Review the changes and test your application');
console.log('   • Remove any remaining Amazon environment variables');
console.log('   • Update your README if it mentions Amazon features');
