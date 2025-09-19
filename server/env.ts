import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration schema with friendly validation
const envSchema = z.object({
  // Core application settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().optional(),
  
  // Amazon PA-API Configuration (required for Amazon features)
  AMAZON_ACCESS_KEY: z.string().optional().describe('Amazon PA-API Access Key'),
  AMAZON_SECRET_KEY: z.string().optional().describe('Amazon PA-API Secret Key'),
  AMAZON_PARTNER_TAG: z.string().optional().describe('Amazon Associate Partner Tag (e.g., mystore-20)'),
  AMAZON_REGION: z.string().default('us-east-1').describe('Amazon PA-API Region'),
  AMAZON_API_HOST: z.string().default('webservices.amazon.com').describe('Amazon PA-API Host'),
  AMAZON_STORE_DOMAIN: z.string().default('www.amazon.com').describe('Amazon Store Domain for Links'),
  
  // Content Discovery APIs
  PERPLEXITY_API_KEY: z.string().optional().describe('Perplexity API Key for trend discovery'),
  REDDIT_CLIENT_ID: z.string().optional().describe('Reddit API Client ID'),
  REDDIT_CLIENT_SECRET: z.string().optional().describe('Reddit API Client Secret'),
  
  // Cache Configuration
  REDIS_URL: z.string().optional().describe('Redis URL for caching (optional - falls back to file cache)'),
  
  // Monetization Settings
  MONETIZATION_ASC_SUBTAG_PREFIX: z.string().default('glowbot_').describe('Default ascsubtag prefix'),
  VITE_DEFAULT_PARTNER_TAG: z.string().optional().describe('Default partner tag for frontend'),
  VITE_ASC_PREFIX: z.string().optional().describe('Frontend ascsubtag prefix'),
  
  // Existing application keys
  APP_PASSWORD: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  LINK_SIGNING_SECRET: z.string().optional(),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const friendlyErrors = error.errors.map(err => {
      const path = err.path.join('.');
      const message = err.message;
      return `  ❌ ${path}: ${message}`;
    });
    
    console.error('❌ Environment Configuration Errors:');
    console.error(friendlyErrors.join('\n'));
    console.error('\n💡 Fix these issues in your .env file and restart the server.');
    process.exit(1);
  }
  throw error;
}

// Feature availability checks with friendly messages
export const features = {
  amazon: {
    enabled: !!(env.AMAZON_ACCESS_KEY && env.AMAZON_SECRET_KEY && env.AMAZON_PARTNER_TAG),
    get message() {
      if (!env.AMAZON_ACCESS_KEY) return 'Missing AMAZON_ACCESS_KEY - Add your PA-API access key to enable Amazon features';
      if (!env.AMAZON_SECRET_KEY) return 'Missing AMAZON_SECRET_KEY - Add your PA-API secret key to enable Amazon features';
      if (!env.AMAZON_PARTNER_TAG) return 'Missing AMAZON_PARTNER_TAG - Add your Amazon Associate tag to enable monetization';
      return 'Amazon PA-API integration enabled';
    }
  },
  
  perplexity: {
    enabled: !!env.PERPLEXITY_API_KEY,
    get message() {
      return env.PERPLEXITY_API_KEY 
        ? 'Perplexity trend discovery enabled' 
        : 'Missing PERPLEXITY_API_KEY - Add your Perplexity API key to enable hybrid trend discovery';
    }
  },
  
  reddit: {
    enabled: !!(env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET),
    get message() {
      if (!env.REDDIT_CLIENT_ID) return 'Missing REDDIT_CLIENT_ID - Add Reddit API credentials for trend discovery';
      if (!env.REDDIT_CLIENT_SECRET) return 'Missing REDDIT_CLIENT_SECRET - Add Reddit API secret for trend discovery';
      return 'Reddit trend discovery enabled';
    }
  },
  
  redis: {
    enabled: !!env.REDIS_URL,
    get message() {
      return env.REDIS_URL 
        ? 'Redis caching enabled' 
        : 'Using file-based caching (add REDIS_URL for improved performance)';
    }
  }
};

// Safe getters for environment variables
export const getEnv = (key: keyof typeof env): string | number | undefined => {
  return env[key];
};

export const requireEnv = (key: keyof typeof env, feature: string): string => {
  const value = env[key];
  if (!value) {
    throw new Error(`${key} is required for ${feature}. Please add it to your .env file.`);
  }
  return String(value);
};

// Log feature status on server start
export const logFeatureStatus = () => {
  console.log('\n🔧 Feature Status:');
  Object.entries(features).forEach(([name, feature]) => {
    const status = feature.enabled ? '✅' : '⚠️';
    console.log(`  ${status} ${name}: ${feature.message}`);
  });
  console.log('');
};

// Export the validated environment
export { env };
export default env;