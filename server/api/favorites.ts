import { Router } from 'express';
import { db } from '../db';
import { favoriteProducts, trendingProducts } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get user's favorite products
router.get('/products', async (req, res) => {
  try {
    // For now, use a default user ID of 1 (in a real app, this would come from auth)
    const userId = 1;
    
    const favorites = await db
      .select()
      .from(favoriteProducts)
      .where(eq(favoriteProducts.userId, userId));
    
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add product to favorites
router.post('/products', async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = 1; // Default user ID
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Check if already favorited
    const existing = await db
      .select()
      .from(favoriteProducts)
      .where(and(
        eq(favoriteProducts.userId, userId),
        eq(favoriteProducts.productId, productId)
      ));
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }
    
    // Add to favorites
    const result = await db
      .insert(favoriteProducts)
      .values({
        userId,
        productId,
      })
      .returning();
    
    res.json({ success: true, favorite: result[0] });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove product from favorites
router.delete('/products', async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = 1; // Default user ID
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Remove from favorites
    const result = await db
      .delete(favoriteProducts)
      .where(and(
        eq(favoriteProducts.userId, userId),
        eq(favoriteProducts.productId, productId)
      ))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({ success: true, removed: result[0] });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;