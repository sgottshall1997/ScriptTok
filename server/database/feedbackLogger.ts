import sqlite3 from 'sqlite3';
import path from 'path';

// Database file path
const DB_PATH = path.join(__dirname, 'feedback.db');

interface FeedbackEntry {
  id?: number;
  productName: string;
  templateType: string;
  tone: string;
  generatedOutput: string;
  userPick?: boolean;
  starRating?: number;
  clickCount?: number;
  timestamp?: string;
}

interface FeedbackUpdate {
  userPick?: boolean;
  starRating?: number;
  clickCount?: number;
}

class FeedbackLogger {
  private db!: sqlite3.Database;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening feedback database:', err.message);
        return;
      }
      console.log('Connected to SQLite feedback database.');
      this.createTable();
    });
  }

  private createTable(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS feedback_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productName TEXT NOT NULL,
        templateType TEXT NOT NULL,
        tone TEXT NOT NULL,
        generatedOutput TEXT NOT NULL,
        userPick BOOLEAN DEFAULT 0,
        starRating INTEGER DEFAULT 0,
        clickCount INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating feedback_log table:', err.message);
      } else {
        console.log('✅ Feedback log table initialized successfully.');
      }
    });
  }

  // Insert new feedback entry
  async insertFeedback(productName: string, templateType: string, tone: string, generatedOutput: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO feedback_log (productName, templateType, tone, generatedOutput)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(insertSQL, [productName, templateType, tone, generatedOutput], function(err) {
        if (err) {
          console.error('Error inserting feedback:', err.message);
          reject(err);
        } else {
          console.log(`📊 Feedback entry created with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  }

  // Update user interaction data
  async updateFeedback(id: number, updates: FeedbackUpdate): Promise<number> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['userPick', 'starRating', 'clickCount'];
      const updateFields: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key as keyof FeedbackUpdate] !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(updates[key as keyof FeedbackUpdate]);
        }
      });

      if (updateFields.length === 0) {
        reject(new Error('No valid fields to update'));
        return;
      }

      values.push(id);
      const updateSQL = `UPDATE feedback_log SET ${updateFields.join(', ')} WHERE id = ?`;

      this.db.run(updateSQL, values, function(err) {
        if (err) {
          console.error('Error updating feedback:', err.message);
          reject(err);
        } else {
          console.log(`📈 Feedback entry ${id} updated. Changes: ${this.changes}`);
          resolve(this.changes);
        }
      });
    });
  }

  // Increment click count
  async incrementClickCount(id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const updateSQL = `UPDATE feedback_log SET clickCount = clickCount + 1 WHERE id = ?`;
      
      this.db.run(updateSQL, [id], function(err) {
        if (err) {
          console.error('Error incrementing click count:', err.message);
          reject(err);
        } else {
          console.log(`👆 Click count incremented for entry ${id}`);
          resolve(this.changes);
        }
      });
    });
  }

  // Get feedback entries with optional filters
  async getFeedback(filters: any = {}): Promise<FeedbackEntry[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM feedback_log';
      const conditions: string[] = [];
      const values: any[] = [];

      // Add WHERE conditions based on filters
      if (filters.productName) {
        conditions.push('productName LIKE ?');
        values.push(`%${filters.productName}%`);
      }
      if (filters.templateType) {
        conditions.push('templateType = ?');
        values.push(filters.templateType);
      }
      if (filters.tone) {
        conditions.push('tone = ?');
        values.push(filters.tone);
      }
      if (filters.userPick !== undefined) {
        conditions.push('userPick = ?');
        values.push(filters.userPick ? 1 : 0);
      }
      if (filters.minRating) {
        conditions.push('starRating >= ?');
        values.push(filters.minRating);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY timestamp DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(filters.limit);
      }

      this.db.all(query, values, (err, rows) => {
        if (err) {
          console.error('Error retrieving feedback:', err.message);
          reject(err);
        } else {
          resolve(rows as FeedbackEntry[]);
        }
      });
    });
  }

  // Get feedback analytics
  async getAnalytics(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const analyticsSQL = `
        SELECT 
          COUNT(*) as totalEntries,
          AVG(starRating) as avgRating,
          SUM(clickCount) as totalClicks,
          COUNT(CASE WHEN userPick = 1 THEN 1 END) as userPicks,
          templateType,
          tone,
          COUNT(*) as count
        FROM feedback_log 
        GROUP BY templateType, tone
        ORDER BY count DESC
      `;

      this.db.all(analyticsSQL, [], (err, rows) => {
        if (err) {
          console.error('Error getting analytics:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
}

// Create singleton instance
const feedbackLogger = new FeedbackLogger();

// Helper functions for easy usage
export const logFeedback = async (
  productName: string, 
  templateType: string, 
  tone: string, 
  generatedOutput: string
): Promise<number> => {
  return await feedbackLogger.insertFeedback(productName, templateType, tone, generatedOutput);
};

export const updateUserFeedback = async (
  id: number, 
  updates: FeedbackUpdate
): Promise<number> => {
  return await feedbackLogger.updateFeedback(id, updates);
};

export const trackClick = async (id: number): Promise<number> => {
  return await feedbackLogger.incrementClickCount(id);
};

export const getFeedbackData = async (filters?: any): Promise<FeedbackEntry[]> => {
  return await feedbackLogger.getFeedback(filters);
};

export const getFeedbackAnalytics = async (): Promise<any[]> => {
  return await feedbackLogger.getAnalytics();
};

export default feedbackLogger;