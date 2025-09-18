import express from 'express';
import { initializeCookAIngSeedData, checkSeedDataExists, cleanupSeedData } from '../services/seedDataService';

const seedDataRouter = express.Router();

/**
 * Initialize CookAIng Marketing Engine seed data
 * Creates 50 contacts + 1 sample campaign
 */
seedDataRouter.post('/initialize', async (req, res) => {
  try {
    // Check if seed data already exists
    const exists = await checkSeedDataExists();
    if (exists) {
      return res.status(200).json({
        success: true,
        message: 'Seed data already exists. Use /cleanup then /initialize to recreate.',
        exists: true
      });
    }

    // Initialize seed data
    const result = await initializeCookAIngSeedData();
    
    res.status(201).json({
      success: true,
      message: 'CookAIng Marketing Engine seed data initialized successfully!',
      data: {
        organizations: result.organizations.length,
        contacts: result.contacts.length,
        campaigns: 1
      }
    });
  } catch (error) {
    console.error('Error initializing seed data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize seed data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Check if seed data exists
 */
seedDataRouter.get('/status', async (req, res) => {
  try {
    const exists = await checkSeedDataExists();
    res.json({
      success: true,
      seedDataExists: exists,
      message: exists ? 'Seed data found' : 'No seed data found'
    });
  } catch (error) {
    console.error('Error checking seed data status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check seed data status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clean up seed data (for testing purposes)
 */
seedDataRouter.delete('/cleanup', async (req, res) => {
  try {
    await cleanupSeedData();
    res.json({
      success: true,
      message: 'Seed data cleaned up successfully'
    });
  } catch (error) {
    console.error('Error cleaning up seed data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup seed data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { seedDataRouter };