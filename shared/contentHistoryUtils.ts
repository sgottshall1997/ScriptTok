// Utilities for content generation history tracking
import { ContentGenerationEntry, CONTENT_HISTORY_STORAGE_KEY, MAX_HISTORY_ENTRIES } from './contentGenerationHistory';

export class ContentHistoryManager {
  
  // Save a new content generation entry to local storage
  static saveEntry(entry: Omit<ContentGenerationEntry, 'id' | 'timestamp'>) {
    try {
      const existingHistory = this.getHistory();
      
      const newEntry: ContentGenerationEntry = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...entry
      };

      // Add to beginning of array (most recent first)
      const updatedHistory = [newEntry, ...existingHistory];
      
      // Keep only the latest MAX_HISTORY_ENTRIES
      const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ENTRIES);
      
      localStorage.setItem(CONTENT_HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
      
      console.log('✅ Content generation entry saved to history:', {
        id: newEntry.id,
        product: newEntry.productName,
        niche: newEntry.niche,
        platforms: newEntry.platformsSelected,
        template: newEntry.templateUsed
      });
      
      return newEntry;
    } catch (error) {
      console.error('❌ Failed to save content generation entry:', error);
      return null;
    }
  }

  // Get all content generation history from local storage
  static getHistory(): ContentGenerationEntry[] {
    try {
      const stored = localStorage.getItem(CONTENT_HISTORY_STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      
      // Convert timestamp strings back to Date objects
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('❌ Failed to load content generation history:', error);
      return [];
    }
  }

  // Filter history by criteria
  static filterHistory(filters: {
    niche?: string;
    platform?: string;
    template?: string;
    dateRange?: { start: Date; end: Date };
  }): ContentGenerationEntry[] {
    const history = this.getHistory();
    
    return history.filter(entry => {
      // Filter by niche
      if (filters.niche && filters.niche !== 'all' && entry.niche !== filters.niche) {
        return false;
      }
      
      // Filter by platform
      if (filters.platform && filters.platform !== 'all' && 
          !entry.platformsSelected.includes(filters.platform)) {
        return false;
      }
      
      // Filter by template
      if (filters.template && filters.template !== 'all' && entry.templateUsed !== filters.template) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateRange) {
        const entryDate = new Date(entry.timestamp);
        if (entryDate < filters.dateRange.start || entryDate > filters.dateRange.end) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Clear all history
  static clearHistory() {
    try {
      localStorage.removeItem(CONTENT_HISTORY_STORAGE_KEY);
      console.log('✅ Content generation history cleared');
    } catch (error) {
      console.error('❌ Failed to clear content generation history:', error);
    }
  }

  // Remove specific entry by ID
  static removeEntry(id: string) {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(entry => entry.id !== id);
      localStorage.setItem(CONTENT_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      console.log('✅ Content generation entry removed:', id);
    } catch (error) {
      console.error('❌ Failed to remove content generation entry:', error);
    }
  }

  // Check for duplicate entries within the same session
  static isDuplicate(
    productName: string, 
    platforms: string[], 
    sessionId?: string
  ): boolean {
    if (!sessionId) return false;
    
    const history = this.getHistory();
    
    return history.some(entry => 
      entry.sessionId === sessionId &&
      entry.productName === productName &&
      JSON.stringify(entry.platformsSelected.sort()) === JSON.stringify(platforms.sort())
    );
  }

  // Get stats for analytics
  static getStats() {
    const history = this.getHistory();
    
    const stats = {
      totalGenerations: history.length,
      byNiche: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
      byTemplate: {} as Record<string, number>,
      recentActivity: history.slice(0, 5) // Last 5 generations
    };

    history.forEach(entry => {
      // Count by niche
      stats.byNiche[entry.niche] = (stats.byNiche[entry.niche] || 0) + 1;
      
      // Count by template
      stats.byTemplate[entry.templateUsed] = (stats.byTemplate[entry.templateUsed] || 0) + 1;
      
      // Count by platform
      entry.platformsSelected.forEach(platform => {
        stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      });
    });

    return stats;
  }
}