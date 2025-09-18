import { emailService } from '../cookaing-marketing/email/email.service';

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'email' | 'social' | 'push' | 'webhook' | 'affiliate' | 'ai' | 'database';
  status: 'healthy' | 'warning' | 'error' | 'not_configured';
  message: string;
  details?: {
    providers?: string[];
    configuredKeys?: string[];
    missingKeys?: string[];
    lastChecked: string;
  };
}

export interface IntegrationHealthSummary {
  totalIntegrations: number;
  healthy: number;
  warnings: number;
  errors: number;
  notConfigured: number;
  lastUpdated: string;
  integrations: IntegrationStatus[];
}

export class IntegrationHealthService {
  
  /**
   * Check email service health
   */
  private async checkEmailHealth(): Promise<IntegrationStatus> {
    try {
      const config = await emailService.testConfiguration();
      const providers = config.providers;
      const hasProviders = providers.length > 0;
      
      if (!hasProviders) {
        return {
          id: 'email',
          name: 'Email Service',
          category: 'email',
          status: 'not_configured',
          message: 'No email providers configured',
          details: {
            providers: [],
            configuredKeys: [],
            missingKeys: ['BREVO_API_KEY', 'RESEND_API_KEY'],
            lastChecked: new Date().toISOString()
          }
        };
      }

      if (config.errors && config.errors.length > 0) {
        return {
          id: 'email',
          name: 'Email Service',
          category: 'email',
          status: 'warning',
          message: `Partial configuration: ${config.errors.join(', ')}`,
          details: {
            providers,
            configuredKeys: providers.map((p: string) => p === 'brevo' ? 'BREVO_API_KEY' : 'RESEND_API_KEY'),
            missingKeys: config.errors,
            lastChecked: new Date().toISOString()
          }
        };
      }

      return {
        id: 'email',
        name: 'Email Service',
        category: 'email',
        status: 'healthy',
        message: `${providers.length} provider(s) configured: ${providers.join(', ')}`,
        details: {
          providers,
          configuredKeys: providers.map((p: string) => p === 'brevo' ? 'BREVO_API_KEY' : 'RESEND_API_KEY'),
          missingKeys: [],
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        id: 'email',
        name: 'Email Service',
        category: 'email',
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          lastChecked: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Check push notification service health
   */
  private checkPushHealth(): IntegrationStatus {
    const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;
    
    const configuredKeys = [];
    const missingKeys = [];
    
    if (oneSignalAppId) configuredKeys.push('ONESIGNAL_APP_ID');
    else missingKeys.push('ONESIGNAL_APP_ID');
    
    if (oneSignalApiKey) configuredKeys.push('ONESIGNAL_API_KEY');
    else missingKeys.push('ONESIGNAL_API_KEY');
    
    if (configuredKeys.length === 0) {
      return {
        id: 'push',
        name: 'Push Notifications',
        category: 'push',
        status: 'not_configured',
        message: 'OneSignal not configured',
        details: {
          configuredKeys,
          missingKeys,
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    if (missingKeys.length > 0) {
      return {
        id: 'push',
        name: 'Push Notifications',
        category: 'push',
        status: 'warning',
        message: `OneSignal partially configured, missing: ${missingKeys.join(', ')}`,
        details: {
          configuredKeys,
          missingKeys,
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    return {
      id: 'push',
      name: 'Push Notifications',
      category: 'push',
      status: 'healthy',
      message: 'OneSignal fully configured',
      details: {
        configuredKeys,
        missingKeys,
        lastChecked: new Date().toISOString()
      }
    };
  }

  /**
   * Check AI service health
   */
  private checkAIHealth(): IntegrationStatus {
    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    
    const configuredKeys = [];
    const providers = [];
    
    if (openAiKey) {
      configuredKeys.push('OPENAI_API_KEY');
      providers.push('OpenAI');
    }
    if (anthropicKey) {
      configuredKeys.push('ANTHROPIC_API_KEY');
      providers.push('Anthropic Claude');
    }
    if (perplexityKey) {
      configuredKeys.push('PERPLEXITY_API_KEY');
      providers.push('Perplexity');
    }
    
    if (configuredKeys.length === 0) {
      return {
        id: 'ai',
        name: 'AI Services',
        category: 'ai',
        status: 'not_configured',
        message: 'No AI providers configured',
        details: {
          providers: [],
          configuredKeys: [],
          missingKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY'],
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    if (configuredKeys.length < 3) {
      const missingKeys = [];
      if (!openAiKey) missingKeys.push('OPENAI_API_KEY');
      if (!anthropicKey) missingKeys.push('ANTHROPIC_API_KEY');
      if (!perplexityKey) missingKeys.push('PERPLEXITY_API_KEY');
      
      return {
        id: 'ai',
        name: 'AI Services',
        category: 'ai',
        status: 'warning',
        message: `${providers.length}/3 AI providers configured`,
        details: {
          providers,
          configuredKeys,
          missingKeys,
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    return {
      id: 'ai',
      name: 'AI Services',
      category: 'ai',
      status: 'healthy',
      message: `All 3 AI providers configured: ${providers.join(', ')}`,
      details: {
        providers,
        configuredKeys,
        missingKeys: [],
        lastChecked: new Date().toISOString()
      }
    };
  }

  /**
   * Check webhook service health
   */
  private checkWebhookHealth(): IntegrationStatus {
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (!makeWebhookUrl) {
      return {
        id: 'webhook',
        name: 'Webhook Integration',
        category: 'webhook',
        status: 'not_configured',
        message: 'Make.com webhook URL not configured',
        details: {
          configuredKeys: [],
          missingKeys: ['MAKE_WEBHOOK_URL'],
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    // Basic URL validation
    try {
      new URL(makeWebhookUrl);
      const isMakeUrl = makeWebhookUrl.includes('make.com');
      
      return {
        id: 'webhook',
        name: 'Webhook Integration',
        category: 'webhook',
        status: isMakeUrl ? 'healthy' : 'warning',
        message: isMakeUrl ? 'Make.com webhook configured' : 'Custom webhook URL configured',
        details: {
          providers: [isMakeUrl ? 'Make.com' : 'Custom'],
          configuredKeys: ['MAKE_WEBHOOK_URL'],
          missingKeys: [],
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        id: 'webhook',
        name: 'Webhook Integration',
        category: 'webhook',
        status: 'error',
        message: 'Invalid webhook URL format',
        details: {
          configuredKeys: ['MAKE_WEBHOOK_URL'],
          missingKeys: [],
          lastChecked: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Check affiliate service health
   */
  private checkAffiliateHealth(): IntegrationStatus {
    const amazonTag = process.env.AMAZON_AFFILIATE_TAG;
    
    if (!amazonTag) {
      return {
        id: 'affiliate',
        name: 'Affiliate Networks',
        category: 'affiliate',
        status: 'not_configured',
        message: 'Amazon affiliate tag not configured',
        details: {
          providers: [],
          configuredKeys: [],
          missingKeys: ['AMAZON_AFFILIATE_TAG'],
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    return {
      id: 'affiliate',
      name: 'Affiliate Networks',
      category: 'affiliate',
      status: 'healthy',
      message: 'Amazon affiliate tag configured',
      details: {
        providers: ['Amazon Associates'],
        configuredKeys: ['AMAZON_AFFILIATE_TAG'],
        missingKeys: [],
        lastChecked: new Date().toISOString()
      }
    };
  }

  /**
   * Check database health
   */
  private checkDatabaseHealth(): IntegrationStatus {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return {
        id: 'database',
        name: 'Database Connection',
        category: 'database',
        status: 'not_configured',
        message: 'Database URL not configured',
        details: {
          configuredKeys: [],
          missingKeys: ['DATABASE_URL'],
          lastChecked: new Date().toISOString()
        }
      };
    }
    
    // Basic URL validation
    try {
      const url = new URL(databaseUrl);
      const isPostgres = url.protocol === 'postgresql:' || url.protocol === 'postgres:';
      
      return {
        id: 'database',
        name: 'Database Connection',
        category: 'database',
        status: 'healthy',
        message: `${isPostgres ? 'PostgreSQL' : 'Database'} connection configured`,
        details: {
          providers: [isPostgres ? 'PostgreSQL' : 'Database'],
          configuredKeys: ['DATABASE_URL'],
          missingKeys: [],
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        id: 'database',
        name: 'Database Connection',
        category: 'database',
        status: 'error',
        message: 'Invalid database URL format',
        details: {
          configuredKeys: ['DATABASE_URL'],
          missingKeys: [],
          lastChecked: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get comprehensive health status for all integrations
   */
  async getHealthSummary(): Promise<IntegrationHealthSummary> {
    const integrations = await Promise.all([
      this.checkEmailHealth(),
      Promise.resolve(this.checkPushHealth()),
      Promise.resolve(this.checkAIHealth()),
      Promise.resolve(this.checkWebhookHealth()),
      Promise.resolve(this.checkAffiliateHealth()),
      Promise.resolve(this.checkDatabaseHealth())
    ]);
    
    const summary = {
      totalIntegrations: integrations.length,
      healthy: integrations.filter(i => i.status === 'healthy').length,
      warnings: integrations.filter(i => i.status === 'warning').length,
      errors: integrations.filter(i => i.status === 'error').length,
      notConfigured: integrations.filter(i => i.status === 'not_configured').length,
      lastUpdated: new Date().toISOString(),
      integrations
    };
    
    return summary;
  }

  /**
   * Get health status for a specific integration
   */
  async getIntegrationHealth(integrationId: string): Promise<IntegrationStatus | null> {
    const summary = await this.getHealthSummary();
    return summary.integrations.find(i => i.id === integrationId) || null;
  }
}

// Export singleton instance
export const integrationHealthService = new IntegrationHealthService();