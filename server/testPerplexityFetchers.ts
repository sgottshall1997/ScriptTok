/**
 * CLI Test Script for All Perplexity Fetchers
 * Tests all 7 niche-specific fetchers and validates their outputs
 */

import { fetchTrendingSkincareProducts } from './services/perplexity/perplexityFetchSkincare.js';
import { fetchTrendingTechProducts } from './services/perplexity/perplexityFetchTech.js';
import { fetchTrendingFashionProducts } from './services/perplexity/perplexityFetchFashion.js';
import { fetchTrendingFitnessProducts } from './services/perplexity/perplexityFetchFitness.js';
import { fetchTrendingFoodProducts } from './services/perplexity/perplexityFetchFood.js';
import { fetchTrendingTravelProducts } from './services/perplexity/perplexityFetchTravel.js';
import { fetchTrendingPetsProducts } from './services/perplexity/perplexityFetchPets.js';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

interface FetcherTest {
  name: string;
  niche: string;
  fetcher: () => Promise<any[]>;
}

const fetchers: FetcherTest[] = [
  { name: 'Skincare', niche: 'skincare', fetcher: fetchTrendingSkincareProducts },
  { name: 'Tech', niche: 'tech', fetcher: fetchTrendingTechProducts },
  { name: 'Fashion', niche: 'fashion', fetcher: fetchTrendingFashionProducts },
  { name: 'Fitness', niche: 'fitness', fetcher: fetchTrendingFitnessProducts },
  { name: 'Food', niche: 'food', fetcher: fetchTrendingFoodProducts },
  { name: 'Travel', niche: 'travel', fetcher: fetchTrendingTravelProducts },
  { name: 'Pets', niche: 'pets', fetcher: fetchTrendingPetsProducts }
];

function validateProduct(product: any, niche: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check basic structure
  if (!product.product || typeof product.product !== 'string') {
    issues.push('Missing or invalid product name');
  }
  if (!product.brand || typeof product.brand !== 'string') {
    issues.push('Missing or invalid brand name');
  }
  if (!product.mentions || typeof product.mentions !== 'number') {
    issues.push('Missing or invalid mentions count');
  }
  if (!product.reason || typeof product.reason !== 'string') {
    issues.push('Missing or invalid trending reason');
  }
  
  // Check for template/placeholder content
  const productLower = product.product?.toLowerCase() || '';
  const brandLower = product.brand?.toLowerCase() || '';
  
  const bannedTerms = [
    'trending product', 'product name', 'brand name', 'template', 
    'placeholder', 'example', 'format', '...', 'item'
  ];
  
  bannedTerms.forEach(term => {
    if (productLower.includes(term)) {
      issues.push(`Product contains banned term: "${term}"`);
    }
    if (brandLower.includes(term)) {
      issues.push(`Brand contains banned term: "${term}"`);
    }
  });
  
  // Check for template headers
  if (/^name\s*\|\s*brand/i.test(productLower)) {
    issues.push('Product appears to be a template header');
  }
  
  // Check mentions range
  if (product.mentions && (product.mentions < 50000 || product.mentions > 2000000)) {
    issues.push(`Mentions out of range: ${product.mentions} (should be 50K-2M)`);
  }
  
  // Check word count
  const words = product.product?.split(' ').filter((w: string) => w.length > 0) || [];
  if (words.length < 2) {
    issues.push('Product name too short (needs at least 2 words)');
  }
  
  return { valid: issues.length === 0, issues };
}

async function testFetcher(test: FetcherTest): Promise<{ success: boolean; products: any[]; errors: string[] }> {
  try {
    console.log(`${colors.blue}Testing ${test.name} fetcher...${colors.reset}`);
    
    const startTime = Date.now();
    const products = await test.fetcher();
    const endTime = Date.now();
    
    console.log(`  Response time: ${endTime - startTime}ms`);
    
    if (!Array.isArray(products)) {
      return { success: false, products: [], errors: ['Response is not an array'] };
    }
    
    if (products.length !== 3) {
      return { 
        success: false, 
        products, 
        errors: [`Expected 3 products, got ${products.length}`] 
      };
    }
    
    const allErrors: string[] = [];
    let validCount = 0;
    
    products.forEach((product, index) => {
      const validation = validateProduct(product, test.niche);
      if (validation.valid) {
        validCount++;
        console.log(`  ${colors.green}✓${colors.reset} Product ${index + 1}: ${product.product} by ${product.brand}`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} Product ${index + 1}: ${validation.issues.join(', ')}`);
        allErrors.push(...validation.issues.map(issue => `Product ${index + 1}: ${issue}`));
      }
    });
    
    const success = validCount === 3;
    console.log(`  Valid products: ${validCount}/3`);
    
    return { success, products, errors: allErrors };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`  ${colors.red}✗ Error: ${errorMessage}${colors.reset}`);
    return { success: false, products: [], errors: [errorMessage] };
  }
}

async function runAllTests(): Promise<void> {
  console.log(`${colors.bold}${colors.blue}🧪 Perplexity Fetchers Test Suite${colors.reset}`);
  console.log(`${colors.blue}Testing all 7 niche-specific fetchers...${colors.reset}\n`);
  
  const startTime = Date.now();
  let successCount = 0;
  let totalProducts = 0;
  
  const results: { [key: string]: any } = {};
  
  for (const test of fetchers) {
    console.log(`${colors.yellow}=== ${test.name.toUpperCase()} NICHE ===${colors.reset}`);
    
    const result = await testFetcher(test);
    results[test.niche] = result;
    
    if (result.success) {
      successCount++;
      console.log(`${colors.green}✅ ${test.name}: PASSED${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${test.name}: FAILED${colors.reset}`);
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`   ${colors.red}• ${error}${colors.reset}`);
        });
      }
    }
    
    totalProducts += result.products.length;
    console.log(''); // Empty line for spacing
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Summary report
  console.log(`${colors.bold}${colors.blue}📊 SUMMARY REPORT${colors.reset}`);
  console.log(`${colors.blue}=================${colors.reset}`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Fetchers tested: ${fetchers.length}`);
  console.log(`${colors.green}Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${fetchers.length - successCount}${colors.reset}`);
  console.log(`Total products fetched: ${totalProducts}`);
  console.log(`Expected products: ${fetchers.length * 3}`);
  
  if (successCount === fetchers.length) {
    console.log(`\n${colors.green}${colors.bold}🎉 ALL TESTS PASSED! All fetchers are working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️  ${fetchers.length - successCount} FETCHER(S) FAILED! Review the errors above.${colors.reset}`);
  }
  
  // Product examples
  console.log(`\n${colors.blue}📦 SAMPLE PRODUCTS:${colors.reset}`);
  Object.entries(results).forEach(([niche, result]) => {
    if (result.success && result.products.length > 0) {
      const product = result.products[0];
      console.log(`${colors.green}${niche}${colors.reset}: ${product.product} by ${product.brand} (${product.mentions.toLocaleString()} mentions)`);
    }
  });
  
  process.exit(successCount === fetchers.length ? 0 : 1);
}

// Run the test suite
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error running test suite: ${error.message}${colors.reset}`);
  process.exit(1);
});