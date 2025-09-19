#!/usr/bin/env tsx

import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Color helpers for better CLI experience
const colors = {
  cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
  red: (str: string) => `\x1b[31m${str}\x1b[0m`,
  bold: (str: string) => `\x1b[1m${str}\x1b[0m`,
  dim: (str: string) => `\x1b[2m${str}\x1b[0m`,
};

interface SecretConfig {
  key: string;
  description: string;
  required: boolean;
  category: string;
  example?: string;
  validation?: (value: string) => boolean | string;
}

const secrets: SecretConfig[] = [
  // Amazon PA-API (required for monetization)
  {
    key: 'AMAZON_ACCESS_KEY',
    description: 'Amazon PA-API Access Key from your Amazon Associate account',
    required: true,
    category: 'Amazon PA-API',
    example: 'AKIAIOSFODNN7EXAMPLE',
    validation: (val) => val.length > 10 || 'Access key seems too short'
  },
  {
    key: 'AMAZON_SECRET_KEY',
    description: 'Amazon PA-API Secret Key from your Amazon Associate account',
    required: true,
    category: 'Amazon PA-API',
    example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    validation: (val) => val.length > 20 || 'Secret key seems too short'
  },
  {
    key: 'AMAZON_PARTNER_TAG',
    description: 'Your Amazon Associate Partner Tag (tracking ID)',
    required: true,
    category: 'Amazon PA-API',
    example: 'mystore-20',
    validation: (val) => /^[a-zA-Z0-9\-]+$/.test(val) || 'Partner tag should contain only letters, numbers, and hyphens'
  },
  {
    key: 'AMAZON_REGION',
    description: 'Amazon PA-API Region',
    required: false,
    category: 'Amazon PA-API',
    example: 'us-east-1'
  },
  {
    key: 'AMAZON_API_HOST',
    description: 'Amazon PA-API Host',
    required: false,
    category: 'Amazon PA-API',
    example: 'webservices.amazon.com'
  },
  {
    key: 'AMAZON_STORE_DOMAIN',
    description: 'Amazon Store Domain for user links',
    required: false,
    category: 'Amazon PA-API',
    example: 'www.amazon.com'
  },
  
  // Content Discovery APIs
  {
    key: 'PERPLEXITY_API_KEY',
    description: 'Perplexity API Key for hybrid trend discovery',
    required: false,
    category: 'Content Discovery',
    example: 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    key: 'REDDIT_CLIENT_ID',
    description: 'Reddit API Client ID for trend discovery',
    required: false,
    category: 'Content Discovery',
    example: 'Xxxxxxxxxxxxxxxxxxx'
  },
  {
    key: 'REDDIT_CLIENT_SECRET',
    description: 'Reddit API Client Secret',
    required: false,
    category: 'Content Discovery',
    example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  
  // Cache & Performance
  {
    key: 'REDIS_URL',
    description: 'Redis URL for improved caching performance (optional)',
    required: false,
    category: 'Performance',
    example: 'redis://localhost:6379'
  },
  
  // Monetization Settings
  {
    key: 'MONETIZATION_ASC_SUBTAG_PREFIX',
    description: 'Default ascsubtag prefix for attribution tracking',
    required: false,
    category: 'Monetization',
    example: 'glowbot_'
  }
];

class SecretsSetup {
  private rl: readline.Interface;
  private envPath = path.join(process.cwd(), '.env');
  private existingEnv: Record<string, string> = {};

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.loadExistingEnv();
  }

  private loadExistingEnv() {
    try {
      if (fs.existsSync(this.envPath)) {
        const content = fs.readFileSync(this.envPath, 'utf8');
        content.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            this.existingEnv[key.trim()] = valueParts.join('=').trim();
          }
        });
      }
    } catch (error) {
      console.warn(colors.yellow('Warning: Could not read existing .env file'));
    }
  }

  private async promptSecret(secret: SecretConfig): Promise<string> {
    const existing = this.existingEnv[secret.key];
    const hasExisting = existing && existing.length > 0;
    
    console.log(`\n${colors.bold(secret.key)}`);
    console.log(colors.dim(secret.description));
    
    if (secret.example) {
      console.log(colors.dim(`Example: ${secret.example}`));
    }
    
    if (hasExisting) {
      console.log(colors.green(`Current: ${existing.substring(0, 10)}${'*'.repeat(Math.max(0, existing.length - 10))}`));
    }
    
    const promptText = hasExisting 
      ? `${secret.required ? '(required) ' : '(optional) '}Press Enter to keep current, or enter new value: `
      : `${secret.required ? '(required) ' : '(optional) '}Enter value: `;
    
    return new Promise((resolve) => {
      this.rl.question(promptText, (answer) => {
        const value = answer.trim() || existing || '';
        
        // Validate if provided
        if (value && secret.validation) {
          const validation = secret.validation(value);
          if (validation !== true) {
            console.log(colors.red(`❌ ${validation}`));
            this.promptSecret(secret).then(resolve);
            return;
          }
        }
        
        // Check required fields
        if (secret.required && !value) {
          console.log(colors.red(`❌ ${secret.key} is required for Amazon monetization features`));
          this.promptSecret(secret).then(resolve);
          return;
        }
        
        resolve(value);
      });
    });
  }

  private async saveEnv(newSecrets: Record<string, string>) {
    const envLines: string[] = [];
    
    // Keep existing non-secret variables
    Object.entries(this.existingEnv).forEach(([key, value]) => {
      if (!secrets.find(s => s.key === key)) {
        envLines.push(`${key}=${value}`);
      }
    });
    
    // Add/update secrets
    Object.entries(newSecrets).forEach(([key, value]) => {
      if (value) {
        envLines.push(`${key}=${value}`);
      }
    });
    
    const content = envLines.join('\n') + '\n';
    
    try {
      fs.writeFileSync(this.envPath, content, 'utf8');
      console.log(colors.green(`\n✅ Environment variables saved to ${this.envPath}`));
    } catch (error) {
      console.error(colors.red(`❌ Error saving .env file: ${error}`));
      throw error;
    }
  }

  async run() {
    console.log(colors.bold('\n🔧 GlowBot Amazon Monetization Setup'));
    console.log(colors.dim('Configure your Amazon PA-API credentials and other settings\n'));
    
    const newSecrets: Record<string, string> = {};
    
    // Group secrets by category
    const categories = [...new Set(secrets.map(s => s.category))];
    
    for (const category of categories) {
      console.log(colors.cyan(`\n📁 ${category}`));
      console.log(colors.dim('─'.repeat(40)));
      
      const categorySecrets = secrets.filter(s => s.category === category);
      
      for (const secret of categorySecrets) {
        try {
          const value = await this.promptSecret(secret);
          newSecrets[secret.key] = value;
        } catch (error) {
          console.error(colors.red(`Error processing ${secret.key}: ${error}`));
        }
      }
    }
    
    // Save to .env file
    await this.saveEnv(newSecrets);
    
    // Show summary
    console.log(colors.bold('\n📊 Setup Summary:'));
    
    const amazonEnabled = !!(newSecrets.AMAZON_ACCESS_KEY && newSecrets.AMAZON_SECRET_KEY && newSecrets.AMAZON_PARTNER_TAG);
    const perplexityEnabled = !!newSecrets.PERPLEXITY_API_KEY;
    const redditEnabled = !!(newSecrets.REDDIT_CLIENT_ID && newSecrets.REDDIT_CLIENT_SECRET);
    
    console.log(`  ${amazonEnabled ? '✅' : '❌'} Amazon PA-API (${amazonEnabled ? 'Monetization enabled' : 'Required for monetization'})`);
    console.log(`  ${perplexityEnabled ? '✅' : '⚠️'} Perplexity Trends (${perplexityEnabled ? 'Hybrid discovery enabled' : 'Falls back to static trends'})`);
    console.log(`  ${redditEnabled ? '✅' : '⚠️'} Reddit Discovery (${redditEnabled ? 'Enhanced trends enabled' : 'Optional feature'})`);
    
    if (!amazonEnabled) {
      console.log(colors.yellow('\n⚠️ Amazon monetization features are disabled.'));
      console.log(colors.dim('Add AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG to enable full monetization.'));
    }
    
    console.log(colors.green('\n🚀 Setup complete! Run npm run dev to start the server.'));
    
    this.rl.close();
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new SecretsSetup();
  setup.run().catch(error => {
    console.error(colors.red('Setup failed:'), error);
    process.exit(1);
  });
}

export default SecretsSetup;