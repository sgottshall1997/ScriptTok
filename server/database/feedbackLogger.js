const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the metrics database
const dbPath = path.join(__dirname, '../../metrics.db');
const db = new sqlite3.Database(dbPath);

/**
 * Initialize the ai_feedback table
 */
function initializeFeedbackTable() {
  return new Promise((resolve, reject) => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ai_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        niche TEXT NOT NULL,
        product TEXT NOT NULL,
        script TEXT NOT NULL,
        ai_score INTEGER NOT NULL CHECK(ai_score >= 1 AND ai_score <= 10),
        analysis TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating ai_feedback table:', err);
        reject(err);
      } else {
        console.log('✅ AI feedback table initialized successfully.');
        resolve();
      }
    });
  });
}

/**
 * Log feedback for content quality evaluation
 * @param {Object} feedback - The feedback data
 * @param {string} feedback.niche - Content niche
 * @param {string} feedback.product - Product name
 * @param {string} feedback.script - Generated script
 * @param {number} feedback.ai_score - AI quality score (1-10)
 * @param {string} feedback.analysis - AI analysis text
 */
function logFeedback({ niche, product, script, ai_score, analysis }) {
  return new Promise((resolve, reject) => {
    // Convert 0-100 score to 1-10 scale for storage
    const normalizedScore = Math.max(1, Math.min(10, Math.round(ai_score / 10)));
    
    const insertSQL = `
      INSERT INTO ai_feedback (niche, product, script, ai_score, analysis)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(insertSQL, [niche, product, script, normalizedScore, analysis], function(err) {
      if (err) {
        console.error('Error logging AI feedback:', err);
        reject(err);
      } else {
        console.log(`📊 Logged AI feedback for ${niche} content (Score: ${normalizedScore}/10)`);
        resolve({ id: this.lastID, score: normalizedScore });
      }
    });
  });
}

/**
 * Get recent feedback records
 * @param {number} limit - Number of records to return (default: 20)
 */
function getRecentFeedback(limit = 20) {
  return new Promise((resolve, reject) => {
    const selectSQL = `
      SELECT * FROM ai_feedback 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    db.all(selectSQL, [limit], (err, rows) => {
      if (err) {
        console.error('Error fetching recent feedback:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get all feedback records for a specific niche
 * @param {string} niche - The niche to filter by
 */
function getFeedbackByNiche(niche) {
  return new Promise((resolve, reject) => {
    const selectSQL = `
      SELECT * FROM ai_feedback 
      WHERE niche = ? 
      ORDER BY timestamp DESC
    `;
    
    db.all(selectSQL, [niche], (err, rows) => {
      if (err) {
        console.error(`Error fetching feedback for ${niche}:`, err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get average AI scores by niche for performance analysis
 */
function getAverageScoresByNiche() {
  return new Promise((resolve, reject) => {
    const selectSQL = `
      SELECT 
        niche,
        AVG(ai_score) as avg_score,
        COUNT(*) as total_content,
        MAX(timestamp) as latest_content
      FROM ai_feedback 
      GROUP BY niche
      ORDER BY avg_score DESC
    `;
    
    db.all(selectSQL, [], (err, rows) => {
      if (err) {
        console.error('Error fetching average scores:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get top performing content for learning patterns
 * @param {number} minScore - Minimum score threshold (default: 8)
 * @param {number} limit - Number of records to return (default: 10)
 */
function getTopPerformingContent(minScore = 8, limit = 10) {
  return new Promise((resolve, reject) => {
    const selectSQL = `
      SELECT * FROM ai_feedback 
      WHERE ai_score >= ? 
      ORDER BY ai_score DESC, timestamp DESC 
      LIMIT ?
    `;
    
    db.all(selectSQL, [minScore, limit], (err, rows) => {
      if (err) {
        console.error('Error fetching top performing content:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Initialize the table when the module is loaded
initializeFeedbackTable().catch(console.error);

module.exports = {
  logFeedback,
  getRecentFeedback,
  getFeedbackByNiche,
  getAverageScoresByNiche,
  getTopPerformingContent,
  initializeFeedbackTable
};