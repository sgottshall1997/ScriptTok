import { z } from 'zod';

// Notion API types
export interface NotionPage {
  id: string;
  url: string;
  public_url?: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
}

export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  url: string;
}

export interface NotionPageCreateRequest {
  parent: {
    database_id: string;
  };
  properties: {
    Name: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Status?: {
      select: {
        name: string;
      };
    };
    [key: string]: any;
  };
  children: Array<{
    object: 'block';
    type: string;
    [key: string]: any;
  }>;
}

export const publishBlogSchema = z.object({
  campaignId: z.number(),
  title: z.string().optional(),
  status: z.enum(['Draft', 'In Review', 'Published']).default('Draft'),
});

export type PublishBlogRequest = z.infer<typeof publishBlogSchema>;

// Notion API service class
export class NotionService {
  private readonly apiUrl = 'https://api.notion.com/v1';
  private readonly integrationToken: string;
  private readonly databaseId: string;
  private readonly isMockMode: boolean;

  constructor(integrationToken?: string, databaseId?: string) {
    this.integrationToken = integrationToken || '';
    this.databaseId = databaseId || '';
    this.isMockMode = !integrationToken || !databaseId;
  }

  /**
   * Get database information
   */
  async getDatabase(): Promise<NotionDatabase> {
    if (this.isMockMode) {
      console.log('🔧 Notion Mock Mode: Returning mock database info');
      return {
        id: 'mock-database-id',
        title: [{ plain_text: 'CookAIng Blog Posts' }],
        url: 'https://notion.so/mock-database'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/databases/${this.databaseId}`, {
        headers: {
          'Authorization': `Bearer ${this.integrationToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Notion API error:', error);
      throw error;
    }
  }

  /**
   * Create a new page in the blog database
   */
  async createBlogPage(
    title: string, 
    content: string,
    status: string = 'Draft',
    metadata?: Record<string, any>
  ): Promise<NotionPage> {
    if (this.isMockMode) {
      console.log('🔧 Notion Mock Mode: Simulating blog page creation', { title, status });
      
      const mockPageId = `mock-page-${Date.now()}`;
      return {
        id: mockPageId,
        url: `https://notion.so/${mockPageId}`,
        public_url: `https://cookaing-blog.notion.site/${mockPageId}`,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
        properties: {
          Name: { title: [{ plain_text: title }] },
          Status: { select: { name: status } }
        }
      };
    }

    try {
      // Convert content to Notion blocks
      const blocks = this.contentToNotionBlocks(content);

      const pageData: NotionPageCreateRequest = {
        parent: {
          database_id: this.databaseId
        },
        properties: {
          Name: {
            title: [{
              text: {
                content: title
              }
            }]
          },
          Status: {
            select: {
              name: status
            }
          },
          // Add any additional properties from metadata
          ...this.metadataToProperties(metadata || {})
        },
        children: blocks
      };

      const response = await fetch(`${this.apiUrl}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.integrationToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Notion API error:', error);
      throw error;
    }
  }

  /**
   * Update page status
   */
  async updatePageStatus(pageId: string, status: string): Promise<NotionPage> {
    if (this.isMockMode) {
      console.log('🔧 Notion Mock Mode: Simulating page status update');
      return {
        id: pageId,
        url: `https://notion.so/${pageId}`,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
        properties: {
          Status: { select: { name: status } }
        }
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.integrationToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            Status: {
              select: {
                name: status
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Notion API error:', error);
      throw error;
    }
  }

  /**
   * Convert content string to Notion blocks
   */
  private contentToNotionBlocks(content: string): Array<any> {
    const blocks: Array<any> = [];
    
    // Split content by double newlines to create paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      // Check if it's a heading (starts with #)
      if (paragraph.startsWith('#')) {
        const level = (paragraph.match(/^#+/) || [''])[0].length;
        const text = paragraph.replace(/^#+\s*/, '');
        
        const headingType = level === 1 ? 'heading_1' : level === 2 ? 'heading_2' : 'heading_3';
        
        blocks.push({
          object: 'block',
          type: headingType,
          [headingType]: {
            rich_text: [{
              type: 'text',
              text: {
                content: text
              }
            }]
          }
        });
      } else {
        // Regular paragraph
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: {
                content: paragraph
              }
            }]
          }
        });
      }
    });

    return blocks;
  }

  /**
   * Convert metadata to Notion properties
   */
  private metadataToProperties(metadata: Record<string, any>): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (metadata.tags && Array.isArray(metadata.tags)) {
      properties.Tags = {
        multi_select: metadata.tags.map((tag: string) => ({ name: tag }))
      };
    }
    
    if (metadata.publishDate) {
      properties['Publish Date'] = {
        date: {
          start: metadata.publishDate
        }
      };
    }
    
    if (metadata.author) {
      properties.Author = {
        rich_text: [{
          type: 'text',
          text: {
            content: metadata.author
          }
        }]
      };
    }

    return properties;
  }
}

// Create singleton instance
export const notionService = new NotionService(
  process.env.NOTION_INTEGRATION_TOKEN,
  process.env.NOTION_BLOG_DB_ID
);