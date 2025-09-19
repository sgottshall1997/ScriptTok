#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { promisify } from 'util';

interface SecretsConfig {
  AMAZON_ACCESS_KEY?: string;
  AMAZON_SECRET_KEY?: string;
  AMAZON_PARTNER_TAG?: string;
  AMAZON_REGION?: string;
  AMAZON_API_HOST?: string;
  AMAZON_STORE_DOMAIN?: string;
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

async function promptSecrets(): Promise<SecretsConfig> {
  console.log('\n🔐 Amazon PA-API Setup - Configure your affiliate monetization\n');
  console.log('📝 Enter your Amazon Product Advertising API credentials.');
  console.log('💡 Leave blank to skip (will log TODO for later setup)\n');

  const secrets: SecretsConfig = {};

  try {
    console.log('🔑 Amazon PA-API Access Key:');
    console.log('   Get this from: https://webservices.amazon.com/paapi5/documentation/');
    const accessKey = await question('   AMAZON_ACCESS_KEY: ');
    if (accessKey.trim()) secrets.AMAZON_ACCESS_KEY = accessKey.trim();

    console.log('\n🔐 Amazon PA-API Secret Key:');
    const secretKey = await question('   AMAZON_SECRET_KEY: ');
    if (secretKey.trim()) secrets.AMAZON_SECRET_KEY = secretKey.trim();

    console.log('\n🏷️  Amazon Partner/Associate Tag (e.g., yourname-20):');
    console.log('   Your Amazon Associate ID for earning commissions');
    const partnerTag = await question('   AMAZON_PARTNER_TAG: ');
    if (partnerTag.trim()) secrets.AMAZON_PARTNER_TAG = partnerTag.trim();

    console.log('\n🌍 Amazon Region (default: us-east-1):');
    const region = await question('   AMAZON_REGION [us-east-1]: ');
    secrets.AMAZON_REGION = region.trim() || 'us-east-1';

    console.log('\n🌐 Amazon API Host (default: webservices.amazon.com):');
    const apiHost = await question('   AMAZON_API_HOST [webservices.amazon.com]: ');
    secrets.AMAZON_API_HOST = apiHost.trim() || 'webservices.amazon.com';

    console.log('\n🛒 Amazon Store Domain (default: www.amazon.com):');
    const storeDomain = await question('   AMAZON_STORE_DOMAIN [www.amazon.com]: ');
    secrets.AMAZON_STORE_DOMAIN = storeDomain.trim() || 'www.amazon.com';

  } catch (error) {
    console.error('\n❌ Error during input:', error);
    process.exit(1);
  }

  return secrets;
}

function loadExistingEnv(): Record<string, string> {
  const envPath = '.env';
  if (!existsSync(envPath)) {
    return {};
  }

  const envContent = readFileSync(envPath, 'utf8');
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]*?)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

function writeEnvFile(secrets: SecretsConfig): void {
  const existingEnv = loadExistingEnv();
  
  // Merge existing environment variables with new secrets
  const updatedEnv = { ...existingEnv };
  
  // Only update provided secrets
  Object.entries(secrets).forEach(([key, value]) => {
    if (value !== undefined) {
      updatedEnv[key] = value;
    }
  });

  // Build .env content
  const envLines: string[] = [];
  envLines.push('# Amazon Product Advertising API Configuration');
  envLines.push('# Get credentials from: https://webservices.amazon.com/paapi5/documentation/');
  envLines.push('');

  // Add Amazon secrets
  const amazonKeys = [
    'AMAZON_ACCESS_KEY',
    'AMAZON_SECRET_KEY', 
    'AMAZON_PARTNER_TAG',
    'AMAZON_REGION',
    'AMAZON_API_HOST',
    'AMAZON_STORE_DOMAIN'
  ];

  amazonKeys.forEach(key => {
    if (updatedEnv[key]) {
      envLines.push(`${key}=${updatedEnv[key]}`);
    }
  });

  envLines.push('');
  envLines.push('# Other environment variables');

  // Add remaining environment variables
  Object.entries(updatedEnv).forEach(([key, value]) => {
    if (!amazonKeys.includes(key)) {
      envLines.push(`${key}=${value}`);
    }
  });

  writeFileSync('.env', envLines.join('\n'));
}

function createEnvExample(): void {
  const exampleContent = `# Amazon Product Advertising API Configuration
# Get credentials from: https://webservices.amazon.com/paapi5/documentation/

AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_PARTNER_TAG=yourname-20
AMAZON_REGION=us-east-1
AMAZON_API_HOST=webservices.amazon.com
AMAZON_STORE_DOMAIN=www.amazon.com

# Optional: Redis cache for faster responses
# REDIS_URL=redis://localhost:6379

# Optional: Perplexity API for trending topics discovery
# PERPLEXITY_API_KEY=your_perplexity_key_here

# Other application secrets
DATABASE_URL=your_database_url_here
`;

  writeFileSync('.env.example', exampleContent);
}

async function main(): Promise<void> {
  console.log('🚀 GlowBot Amazon Affiliate Integration Setup');
  console.log('📋 This will configure your Amazon PA-API credentials for monetization\n');

  try {
    const secrets = await promptSecrets();
    
    // Check if any Amazon secrets were provided
    const hasAmazonSecrets = Object.values(secrets).some(value => 
      value && ['AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY', 'AMAZON_PARTNER_TAG'].includes(
        Object.keys(secrets).find(key => secrets[key as keyof SecretsConfig] === value) || ''
      )
    );

    if (hasAmazonSecrets) {
      writeEnvFile(secrets);
      console.log('\n✅ Secrets saved to .env');
      
      if (secrets.AMAZON_ACCESS_KEY && secrets.AMAZON_SECRET_KEY && secrets.AMAZON_PARTNER_TAG) {
        console.log('🎉 Amazon monetization is fully configured!');
        console.log('💰 You can now earn commissions from Amazon product recommendations');
      } else {
        console.log('⚠️  Partial configuration - some Amazon features may not work');
        if (!secrets.AMAZON_ACCESS_KEY) console.log('   Missing: AMAZON_ACCESS_KEY');
        if (!secrets.AMAZON_SECRET_KEY) console.log('   Missing: AMAZON_SECRET_KEY');
        if (!secrets.AMAZON_PARTNER_TAG) console.log('   Missing: AMAZON_PARTNER_TAG');
      }
    } else {
      console.log('\n📝 No Amazon secrets provided - Amazon features will be disabled');
      console.log('🔧 TODO: Configure Amazon PA-API credentials to enable monetization');
      console.log('   Run this script again when you have your Amazon credentials');
    }

    createEnvExample();
    console.log('📄 Created .env.example with template configuration');

    console.log('\n🎯 Next steps:');
    console.log('   1. npm run dev (start the development server)');
    console.log('   2. Check server logs for enabled/disabled integrations');
    console.log('   3. Visit the monetization settings to configure per-niche tags');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main();