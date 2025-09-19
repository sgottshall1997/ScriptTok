import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables
config();

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Amazon PA-API Configuration
  AMAZON_ACCESS_KEY_ID: z.string().optional(),
  AMAZON_SECRET_ACCESS_KEY: z.string().optional(),
  AMAZON_PARTNER_TAG: z.string().optional(),
  AMAZON_REGION: z.string().default('us-east-1'),
  AMAZON_API_HOST: z.string().default('webservices.amazon.com'),
  AMAZON_STORE_DOMAIN: z.string().default('www.amazon.com'),
  
  // Caching
  REDIS_URL: z.string().optional(),
  
  // External APIs
  PERPLEXITY_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // Server Configuration
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Monetization Settings
  MONETIZATION_ASC_SUBTAG_PREFIX: z.string().default('glowbot_'),
  VITE_DEFAULT_PARTNER_TAG: z.string().optional(),
  VITE_ASC_PREFIX: z.string().default('glowbot_'),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`   ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Type-safe environment getters
export const getEnv = () => env;

// Amazon PA-API configuration checker
export const getAmazonConfig = () => {
  const amazonConfig = {
    accessKey: env.AMAZON_ACCESS_KEY_ID,
    secretKey: env.AMAZON_SECRET_ACCESS_KEY,
    partnerTag: env.AMAZON_PARTNER_TAG,
    region: env.AMAZON_REGION,
    apiHost: env.AMAZON_API_HOST,
    storeDomain: env.AMAZON_STORE_DOMAIN,
  };
  
  const isConfigured = !!(amazonConfig.accessKey && amazonConfig.secretKey && amazonConfig.partnerTag);
  
  return {
    ...amazonConfig,
    isConfigured,
    isPartiallyConfigured: !!(amazonConfig.accessKey || amazonConfig.secretKey || amazonConfig.partnerTag)
  };
};

// Cache configuration checker
export const getCacheConfig = () => {
  return {
    redisUrl: env.REDIS_URL,
    useRedis: !!env.REDIS_URL,
    useFileCache: !env.REDIS_URL
  };
};

// External API configuration checkers
export const getExternalAPIConfig = () => {
  return {
    perplexity: {
      apiKey: env.PERPLEXITY_API_KEY,
      isConfigured: !!env.PERPLEXITY_API_KEY
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
      isConfigured: !!env.ANTHROPIC_API_KEY
    },
    openai: {
      apiKey: env.OPENAI_API_KEY,
      isConfigured: !!env.OPENAI_API_KEY
    }
  };
};

// Monetization configuration
export const getMonetizationConfig = () => {
  return {
    ascSubtagPrefix: env.MONETIZATION_ASC_SUBTAG_PREFIX,
    defaultPartnerTag: env.VITE_DEFAULT_PARTNER_TAG,
    viteAscPrefix: env.VITE_ASC_PREFIX
  };
};

// Integration status logger
export const logIntegrationStatus = () => {
  console.log('\n🔧 Integration Status:');
  
  const amazon = getAmazonConfig();
  if (amazon.isConfigured) {
    console.log('   ✅ Amazon PA-API: Fully configured (monetization enabled)');
    console.log(`      Partner Tag: ${amazon.partnerTag}`);
    console.log(`      Region: ${amazon.region}`);
  } else if (amazon.isPartiallyConfigured) {
    console.log('   ⚠️  Amazon PA-API: Partially configured (missing credentials)');
    if (!amazon.accessKey) console.log('      Missing: AMAZON_ACCESS_KEY_ID');
    if (!amazon.secretKey) console.log('      Missing: AMAZON_SECRET_ACCESS_KEY');
    if (!amazon.partnerTag) console.log('      Missing: AMAZON_PARTNER_TAG');
  } else {
    console.log('   ❌ Amazon PA-API: Not configured (monetization disabled)');
    console.log('      Run: npm run setup:secrets to configure');
  }
  
  const cache = getCacheConfig();
  if (cache.useRedis) {
    console.log('   ✅ Cache: Redis configured');
  } else {
    console.log('   📁 Cache: Using file-based cache (consider Redis for production)');
  }
  
  const apis = getExternalAPIConfig();
  if (apis.perplexity.isConfigured) {
    console.log('   ✅ Perplexity API: Configured (trending topics enabled)');
  } else {
    console.log('   ❌ Perplexity API: Not configured (using static fallbacks)');
  }
  
  if (apis.anthropic.isConfigured) {
    console.log('   ✅ Anthropic API: Configured');
  } else {
    console.log('   ❌ Anthropic API: Not configured');
  }
  
  console.log('');
};

// Environment-specific helpers
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Friendly error messages for missing secrets
export const getMissingSecretsHelp = () => {
  const missing: string[] = [];
  const amazon = getAmazonConfig();
  
  if (!amazon.isConfigured) {
    missing.push('Amazon PA-API credentials (run: npm run setup:secrets)');
  }
  
  const apis = getExternalAPIConfig();
  if (!apis.perplexity.isConfigured) {
    missing.push('Perplexity API key for trending topics discovery');
  }
  
  return {
    hasMissing: missing.length > 0,
    missing,
    suggestions: [
      'Run: npm run setup:secrets to configure Amazon monetization',
      'Add PERPLEXITY_API_KEY to .env for better trending topics',
      'Add REDIS_URL to .env for better caching performance'
    ]
  };
};

export default env;