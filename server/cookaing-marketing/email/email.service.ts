import { z } from 'zod';

// Email provider types
type EmailProvider = 'brevo' | 'resend';

// Email data structure
interface EmailData {
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  headers?: Record<string, string>;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  error?: string;
}

// Brevo API types
interface BrevoSendEmailRequest {
  sender: { name: string; email: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  headers?: Record<string, string>;
}

interface BrevoSendEmailResponse {
  messageId: string;
}

// Resend API types
interface ResendSendEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

interface ResendSendEmailResponse {
  id: string;
}

export class EmailService {
  private brevoApiKey?: string;
  private resendApiKey?: string;
  private defaultFromEmail: string;
  private defaultFromName: string;

  constructor() {
    this.brevoApiKey = process.env.BREVO_API_KEY;
    this.resendApiKey = process.env.RESEND_API_KEY;
    this.defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@cookaing.com';
    this.defaultFromName = process.env.DEFAULT_FROM_NAME || 'CookAIng Marketing';
  }

  /**
   * Send email using available provider (Brevo first, Resend fallback)
   */
  async sendEmail(emailData: EmailData): Promise<EmailSendResult> {
    // Try Brevo first if API key is available
    if (this.brevoApiKey) {
      try {
        console.log('🔵 Attempting to send email via Brevo...');
        const result = await this.sendViaBrevo(emailData);
        console.log('✅ Email sent successfully via Brevo:', result.messageId);
        return result;
      } catch (error) {
        console.error('❌ Brevo send failed:', error);
        // Fall through to try Resend
      }
    }

    // Try Resend as fallback
    if (this.resendApiKey) {
      try {
        console.log('🟡 Attempting to send email via Resend...');
        const result = await this.sendViaResend(emailData);
        console.log('✅ Email sent successfully via Resend:', result.messageId);
        return result;
      } catch (error) {
        console.error('❌ Resend send failed:', error);
        return {
          success: false,
          provider: 'resend',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // No providers available
    return {
      success: false,
      provider: 'brevo', // Default
      error: 'No email providers configured. Please set BREVO_API_KEY or RESEND_API_KEY'
    };
  }

  /**
   * Send email via Brevo (Sendinblue)
   */
  private async sendViaBrevo(emailData: EmailData): Promise<EmailSendResult> {
    const request: BrevoSendEmailRequest = {
      sender: {
        name: this.defaultFromName,
        email: emailData.from || this.defaultFromEmail
      },
      to: [{
        email: emailData.to
      }],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent,
      headers: emailData.headers
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': this.brevoApiKey!,
        'content-type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    const result: BrevoSendEmailResponse = await response.json();
    
    return {
      success: true,
      messageId: result.messageId,
      provider: 'brevo'
    };
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(emailData: EmailData): Promise<EmailSendResult> {
    const request: ResendSendEmailRequest = {
      from: `${this.defaultFromName} <${emailData.from || this.defaultFromEmail}>`,
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
      headers: emailData.headers
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result: ResendSendEmailResponse = await response.json();
    
    return {
      success: true,
      messageId: result.id,
      provider: 'resend'
    };
  }

  /**
   * Check which email providers are configured
   */
  getAvailableProviders(): EmailProvider[] {
    const providers: EmailProvider[] = [];
    if (this.brevoApiKey) providers.push('brevo');
    if (this.resendApiKey) providers.push('resend');
    return providers;
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<{ configured: boolean; providers: EmailProvider[]; errors?: string[] }> {
    const providers = this.getAvailableProviders();
    const errors: string[] = [];

    if (providers.length === 0) {
      errors.push('No email providers configured');
    }

    if (!this.defaultFromEmail) {
      errors.push('DEFAULT_FROM_EMAIL not configured');
    }

    return {
      configured: providers.length > 0 && errors.length === 0,
      providers,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();