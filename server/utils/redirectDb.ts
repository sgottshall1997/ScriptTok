import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

interface RedirectLink {
  id: string;
  originalUrl: string;
  platform: string;
  niche: string;
  createdAt: string;
}

interface RedirectClick {
  redirectId: string;
  timestamp: string;
  platform: string;
  niche: string;
  userAgent: string;
  referrer: string;
}

/**
 * Initialize the redirects database and create tables
 */
export async function initRedirectDB(): Promise<void> {
  try {
    const dbPath = path.join(__dirname, '../../redirects.sqlite');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create redirect_links table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS redirect_links (
        id TEXT PRIMARY KEY,
        originalUrl TEXT NOT NULL,
        platform TEXT NOT NULL,
        niche TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Create redirect_clicks table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS redirect_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        redirectId TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        platform TEXT NOT NULL,
        niche TEXT NOT NULL,
        userAgent TEXT,
        referrer TEXT,
        FOREIGN KEY (redirectId) REFERENCES redirect_links (id)
      )
    `);

    console.log('✅ Redirect database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing redirect database:', error);
    throw error;
  }
}

/**
 * Create a new redirect link
 */
export async function createRedirectLink({
  id,
  originalUrl,
  platform,
  niche
}: {
  id: string;
  originalUrl: string;
  platform: string;
  niche: string;
}): Promise<RedirectLink> {
  if (!db) {
    throw new Error('Database not initialized. Call initRedirectDB() first.');
  }

  const createdAt = new Date().toISOString();
  
  const linkData = {
    id,
    originalUrl,
    platform,
    niche,
    createdAt
  };

  try {
    await db.run(
      `INSERT OR REPLACE INTO redirect_links (id, originalUrl, platform, niche, createdAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, originalUrl, platform, niche, createdAt]
    );

    console.log(`📎 Created redirect link: /redirect/${id} -> ${originalUrl}`);
    return linkData;
  } catch (error) {
    console.error('❌ Error creating redirect link:', error);
    throw error;
  }
}

/**
 * Get a redirect link by ID
 */
export async function getRedirectLink(id: string): Promise<RedirectLink | null> {
  if (!db) {
    throw new Error('Database not initialized. Call initRedirectDB() first.');
  }

  try {
    const link = await db.get<RedirectLink>(
      'SELECT * FROM redirect_links WHERE id = ?',
      [id]
    );

    return link || null;
  } catch (error) {
    console.error('❌ Error getting redirect link:', error);
    throw error;
  }
}

/**
 * Record a click on a redirect link
 */
export async function recordClick({
  redirectId,
  timestamp,
  platform,
  niche,
  userAgent,
  referrer
}: RedirectClick): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized. Call initRedirectDB() first.');
  }

  try {
    await db.run(
      `INSERT INTO redirect_clicks (redirectId, timestamp, platform, niche, userAgent, referrer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [redirectId, timestamp, platform, niche, userAgent || '', referrer || '']
    );

    console.log(`📊 Recorded click: ${redirectId} from ${platform}/${niche}`);
  } catch (error) {
    console.error('❌ Error recording click:', error);
    throw error;
  }
}

/**
 * Get click analytics for a redirect link
 */
export async function getRedirectAnalytics(redirectId: string): Promise<{
  totalClicks: number;
  clicksByPlatform: Record<string, number>;
  clicksByNiche: Record<string, number>;
  recentClicks: any[];
}> {
  if (!db) {
    throw new Error('Database not initialized. Call initRedirectDB() first.');
  }

  try {
    // Get total clicks
    const totalResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM redirect_clicks WHERE redirectId = ?',
      [redirectId]
    );
    const totalClicks = totalResult?.count || 0;

    // Get clicks by platform
    const platformResults = await db.all<{ platform: string; count: number }[]>(
      'SELECT platform, COUNT(*) as count FROM redirect_clicks WHERE redirectId = ? GROUP BY platform',
      [redirectId]
    );
    const clicksByPlatform = platformResults.reduce((acc, row) => {
      acc[row.platform] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Get clicks by niche
    const nicheResults = await db.all<{ niche: string; count: number }[]>(
      'SELECT niche, COUNT(*) as count FROM redirect_clicks WHERE redirectId = ? GROUP BY niche',
      [redirectId]
    );
    const clicksByNiche = nicheResults.reduce((acc, row) => {
      acc[row.niche] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Get recent clicks (last 50)
    const recentClicks = await db.all(
      'SELECT * FROM redirect_clicks WHERE redirectId = ? ORDER BY timestamp DESC LIMIT 50',
      [redirectId]
    );

    return {
      totalClicks,
      clicksByPlatform,
      clicksByNiche,
      recentClicks
    };
  } catch (error) {
    console.error('❌ Error getting redirect analytics:', error);
    throw error;
  }
}

/**
 * Helper function to generate short redirect IDs
 */
export function generateRedirectId(niche: string, platform: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${niche.substring(0, 3)}${platform.substring(0, 2)}${timestamp}${random}`;
}