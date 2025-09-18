import { z } from 'zod';

// Buffer API types and schemas
export interface BufferProfile {
  id: string;
  service: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  service_username: string;
  avatar: string;
  formatted_username: string;
}

export interface BufferUpdate {
  id: string;
  profile_id: string;
  text: string;
  status: 'pending' | 'sent' | 'failed';
  due_time?: number;
  sent_at?: number;
  created_at: number;
  updated_at: number;
}

export interface BufferUpdateRequest {
  text: string;
  profile_ids: string[];
  scheduled_at?: number; // Unix timestamp
  media?: {
    link?: string;
    description?: string;
    title?: string;
    photo?: string;
  };
  shorten?: boolean;
  now?: boolean;
}

export const schedulePostSchema = z.object({
  campaignId: z.number(),
  platform: z.literal("buffer"),
  scheduledAt: z.string().optional(),
  profileIds: z.array(z.string()).optional(),
});

export type SchedulePostRequest = z.infer<typeof schedulePostSchema>;

// Buffer API service class
export class BufferService {
  private readonly apiUrl = 'https://api.bufferapp.com/1';
  private readonly accessToken: string;
  private readonly isMockMode: boolean;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || '';
    this.isMockMode = !accessToken;
  }

  /**
   * Get connected social media profiles
   */
  async getProfiles(): Promise<BufferProfile[]> {
    if (this.isMockMode) {
      console.log('🔧 Buffer Mock Mode: Returning sample profiles');
      return [
        {
          id: 'mock_facebook_123',
          service: 'facebook',
          service_username: 'cookaing_official',
          avatar: 'https://example.com/avatar.jpg',
          formatted_username: 'CookAIng Official'
        },
        {
          id: 'mock_twitter_456',
          service: 'twitter', 
          service_username: 'cookaing',
          avatar: 'https://example.com/avatar.jpg',
          formatted_username: '@cookaing'
        },
        {
          id: 'mock_linkedin_789',
          service: 'linkedin',
          service_username: 'cookaing-company',
          avatar: 'https://example.com/avatar.jpg',
          formatted_username: 'CookAIng Company'
        }
      ];
    }

    try {
      const response = await fetch(`${this.apiUrl}/profiles.json?access_token=${this.accessToken}`);
      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status}`);
      }
      const data = await response.json();
      return data as BufferProfile[];
    } catch (error) {
      console.error('❌ Buffer API error:', error);
      throw error;
    }
  }

  /**
   * Schedule a post to social media
   */
  async scheduleUpdate(updateData: BufferUpdateRequest): Promise<BufferUpdate[]> {
    if (this.isMockMode) {
      console.log('🔧 Buffer Mock Mode: Simulating post scheduling', updateData);
      
      // Generate mock responses for each profile
      const mockUpdates: BufferUpdate[] = updateData.profile_ids.map((profileId, index) => ({
        id: `mock_update_${Date.now()}_${index}`,
        profile_id: profileId,
        text: updateData.text,
        status: 'pending',
        due_time: updateData.scheduled_at,
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
      }));

      return mockUpdates;
    }

    try {
      const formData = new URLSearchParams({
        access_token: this.accessToken,
        text: updateData.text,
        ...updateData.profile_ids.reduce((acc, id, index) => {
          acc[`profile_ids[${index}]`] = id;
          return acc;
        }, {} as Record<string, string>)
      });

      if (updateData.scheduled_at) {
        formData.append('scheduled_at', updateData.scheduled_at.toString());
      }
      if (updateData.now) {
        formData.append('now', 'true');
      }
      if (updateData.shorten !== undefined) {
        formData.append('shorten', updateData.shorten.toString());
      }

      // Add media if provided
      if (updateData.media?.link) {
        formData.append('media[link]', updateData.media.link);
      }
      if (updateData.media?.description) {
        formData.append('media[description]', updateData.media.description);
      }

      const response = await fetch(`${this.apiUrl}/updates/create.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data.updates) ? data.updates : [data];
    } catch (error) {
      console.error('❌ Buffer API error:', error);
      throw error;
    }
  }

  /**
   * Get update status
   */
  async getUpdate(updateId: string): Promise<BufferUpdate> {
    if (this.isMockMode) {
      console.log('🔧 Buffer Mock Mode: Returning mock update status');
      return {
        id: updateId,
        profile_id: 'mock_profile',
        text: 'Mock scheduled post',
        status: Math.random() > 0.5 ? 'sent' : 'pending',
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/updates/${updateId}.json?access_token=${this.accessToken}`);
      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Buffer API error:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled update
   */
  async destroyUpdate(updateId: string): Promise<boolean> {
    if (this.isMockMode) {
      console.log('🔧 Buffer Mock Mode: Simulating post cancellation');
      return true;
    }

    try {
      const response = await fetch(`${this.apiUrl}/updates/${updateId}/destroy.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `access_token=${this.accessToken}`
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Buffer API error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const bufferService = new BufferService(process.env.BUFFER_ACCESS_TOKEN);