import { z } from 'zod';

// OneSignal API types
export interface OneSignalNotification {
  id?: string;
  app_id: string;
  contents: Record<string, string>;
  headings?: Record<string, string>;
  subtitle?: Record<string, string>;
  data?: Record<string, any>;
  url?: string;
  web_url?: string;
  app_url?: string;
  ios_attachments?: Record<string, string>;
  big_picture?: string;
  chrome_web_icon?: string;
  chrome_web_image?: string;
  chrome_web_badge?: string;
  firefox_icon?: string;
  chrome_icon?: string;
  ios_sound?: string;
  android_sound?: string;
  android_led_color?: string;
  android_accent_color?: string;
  android_visibility?: number;
  ios_badgeType?: string;
  ios_badgeCount?: number;
  send_after?: string;
  delayed_option?: string;
  delivery_time_of_day?: string;
  ttl?: number;
  priority?: number;
  apns_alert?: Record<string, any>;
  included_segments?: string[];
  excluded_segments?: string[];
  filters?: Array<Record<string, any>>;
  include_player_ids?: string[];
  include_external_user_ids?: string[];
}

export interface OneSignalResponse {
  id: string;
  recipients: number;
  external_id?: string;
}

export interface OneSignalDeliveryStats {
  successful: number;
  failed: number;
  errored: number;
  converted: number;
  remaining: number;
}

export const sendPushSchema = z.object({
  campaignId: z.number(),
  segmentName: z.string().optional(),
  scheduledAt: z.string().optional(),
  customData: z.record(z.any()).optional(),
});

export type SendPushRequest = z.infer<typeof sendPushSchema>;

// OneSignal API service class
export class OneSignalService {
  private readonly apiUrl = 'https://onesignal.com/api/v1';
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly isMockMode: boolean;

  constructor(appId?: string, apiKey?: string) {
    this.appId = appId || '';
    this.apiKey = apiKey || '';
    this.isMockMode = !appId || !apiKey;
  }

  /**
   * Send push notification
   */
  async sendNotification(notification: OneSignalNotification): Promise<OneSignalResponse> {
    if (this.isMockMode) {
      console.log('🔧 OneSignal Mock Mode: Simulating push notification send', notification);
      
      // Calculate mock recipients based on segments or filters
      let mockRecipients = 0;
      if (notification.included_segments?.includes('All')) {
        mockRecipients = Math.floor(Math.random() * 1000) + 500; // 500-1500 users
      } else if (notification.included_segments?.includes('Active Users')) {
        mockRecipients = Math.floor(Math.random() * 500) + 200; // 200-700 users
      } else if (notification.include_player_ids) {
        mockRecipients = notification.include_player_ids.length;
      } else {
        mockRecipients = Math.floor(Math.random() * 300) + 100; // 100-400 users
      }

      return {
        id: `mock-notification-${Date.now()}`,
        recipients: mockRecipients,
        external_id: notification.data?.external_id
      };
    }

    try {
      // Ensure app_id is set
      const notificationData = {
        ...notification,
        app_id: this.appId
      };

      const response = await fetch(`${this.apiUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OneSignal API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ OneSignal API error:', error);
      throw error;
    }
  }

  /**
   * Get notification delivery stats
   */
  async getNotificationStats(notificationId: string): Promise<OneSignalDeliveryStats> {
    if (this.isMockMode) {
      console.log('🔧 OneSignal Mock Mode: Returning mock delivery stats');
      
      const successful = Math.floor(Math.random() * 800) + 200;
      const failed = Math.floor(Math.random() * 50) + 10;
      const converted = Math.floor(successful * 0.15); // ~15% conversion rate
      
      return {
        successful,
        failed,
        errored: Math.floor(Math.random() * 5),
        converted,
        remaining: 0
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/notifications/${notificationId}?app_id=${this.appId}`, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: data.successful || 0,
        failed: data.failed || 0,
        errored: data.errored || 0,
        converted: data.converted || 0,
        remaining: data.remaining || 0
      };
    } catch (error) {
      console.error('❌ OneSignal API error:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    if (this.isMockMode) {
      console.log('🔧 OneSignal Mock Mode: Simulating notification cancellation');
      return true;
    }

    try {
      const response = await fetch(`${this.apiUrl}/notifications/${notificationId}?app_id=${this.appId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ OneSignal API error:', error);
      throw error;
    }
  }

  /**
   * Get app info and stats
   */
  async getAppInfo(): Promise<any> {
    if (this.isMockMode) {
      console.log('🔧 OneSignal Mock Mode: Returning mock app info');
      return {
        id: 'mock-app-id',
        name: 'CookAIng App',
        players: Math.floor(Math.random() * 10000) + 5000, // 5k-15k users
        messageable_players: Math.floor(Math.random() * 8000) + 4000,
        updated_at: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/apps/${this.appId}`, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ OneSignal API error:', error);
      throw error;
    }
  }

  /**
   * Create segments for targeting
   */
  async createSegment(name: string, filters: Array<Record<string, any>>): Promise<any> {
    if (this.isMockMode) {
      console.log('🔧 OneSignal Mock Mode: Simulating segment creation');
      return {
        id: `mock-segment-${Date.now()}`,
        name: name,
        filters: filters
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/apps/${this.appId}/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        },
        body: JSON.stringify({
          name: name,
          filters: filters
        })
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ OneSignal API error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const oneSignalService = new OneSignalService(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_API_KEY
);