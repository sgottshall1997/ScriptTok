/**
 * Scraper Status API endpoints
 * Provides access to the current status of scrapers and their raw data
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { SCRAPER_PLATFORMS } from '@shared/constants';
import type { ScraperPlatform } from '@shared/constants';

export const scraperStatusRouter = Router();

/**
 * GET /api/scraper-status
 * Get the current status of all scrapers
 */
scraperStatusRouter.get('/', async (req: Request, res: Response) => {
  try {
    const scraperStatus = await storage.getScraperStatus();
    
    // Sort by update time to show most recently updated first
    const sortedStatus = scraperStatus.sort((a, b) => {
      return new Date(b.lastCheck).getTime() - new Date(a.lastCheck).getTime();
    });
    
    return res.status(200).json(sortedStatus);
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    return res.status(500).json({ error: 'Failed to fetch scraper status' });
  }
});

/**
 * GET /api/scraper-data
 * Get raw data from all scrapers
 */
scraperStatusRouter.get('/data', async (req: Request, res: Response) => {
  try {
    // Get trending products from storage
    const trendingProducts = await storage.getTrendingProducts(50);
    
    // Group by source platform
    const groupedBySource: Record<string, any[]> = {};
    
    trendingProducts.forEach(product => {
      const source = product.source;
      if (!groupedBySource[source]) {
        groupedBySource[source] = [];
      }
      
      groupedBySource[source].push({
        title: product.title,
        mentions: product.mentions || 0,
        url: product.sourceUrl || ''
      });
    });
    
    // Format as array of platform data
    const data = Object.entries(groupedBySource).map(([source, products]) => {
      return {
        source,
        products: products.sort((a, b) => b.mentions - a.mentions),
        rawData: JSON.stringify(products.slice(0, 3), null, 2)
      };
    });
    
    // Add empty entries for missing platforms
    SCRAPER_PLATFORMS.forEach(platform => {
      if (!groupedBySource[platform]) {
        data.push({
          source: platform,
          products: [],
          rawData: '{"error": "No data available"}'
        });
      }
    });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching scraper data:', error);
    return res.status(500).json({ error: 'Failed to fetch scraper data' });
  }
});

/**
 * GET /api/scraper-status/:name
 * Get the status of a specific scraper
 */
scraperStatusRouter.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    if (!SCRAPER_PLATFORMS.includes(name as ScraperPlatform)) {
      return res.status(400).json({ error: 'Invalid scraper name' });
    }
    
    const scraperStatus = await storage.getScraperStatus();
    const status = scraperStatus.find(s => s.name === name);
    
    if (!status) {
      return res.status(404).json({ error: 'Scraper status not found' });
    }
    
    return res.status(200).json(status);
  } catch (error) {
    console.error(`Error fetching status for scraper ${req.params.name}:`, error);
    return res.status(500).json({ error: 'Failed to fetch scraper status' });
  }
});