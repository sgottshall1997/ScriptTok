import express from 'express';
import { z } from 'zod';
import { storage } from '../../storage';
import { 
  insertSupportCategorySchema, insertSupportTicketSchema, insertSupportResponseSchema,
  insertKnowledgeBaseArticleSchema, insertLiveChatSessionSchema, insertLiveChatMessageSchema,
  insertSupportMetricSchema
} from '@shared/schema';

const router = express.Router();

// Support Categories Routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await storage.getSupportCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching support categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support categories' });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const category = await storage.getSupportCategory(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching support category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support category' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const data = insertSupportCategorySchema.parse(req.body);
    const category = await storage.createSupportCategory(data);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating support category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create support category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const data = insertSupportCategorySchema.partial().parse(req.body);
    const category = await storage.updateSupportCategory(id, data);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating support category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update support category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const success = await storage.deleteSupportCategory(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting support category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete support category' });
  }
});

// Support Tickets Routes
router.get('/tickets', async (req, res) => {
  try {
    const { status, priority, categoryId, limit } = req.query;
    const filter: any = {};
    
    if (status) filter.status = status as string;
    if (priority) filter.priority = priority as string;
    if (categoryId) filter.categoryId = parseInt(categoryId as string);
    if (limit) filter.limit = parseInt(limit as string);

    const tickets = await storage.getSupportTickets(filter);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support tickets' });
  }
});

router.get('/tickets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket ID' });
    }

    const ticket = await storage.getSupportTicket(id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support ticket' });
  }
});

router.get('/tickets/customer/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const tickets = await storage.getSupportTicketsByCustomer(email);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching customer tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer tickets' });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const data = insertSupportTicketSchema.parse(req.body);
    const ticket = await storage.createSupportTicket(data);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create support ticket' });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket ID' });
    }

    const data = insertSupportTicketSchema.partial().parse(req.body);
    const ticket = await storage.updateSupportTicket(id, data);
    
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update support ticket' });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket ID' });
    }

    const success = await storage.deleteSupportTicket(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to delete support ticket' });
  }
});

// Support Responses Routes
router.get('/tickets/:ticketId/responses', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId)) {
      return res.status(400).json({ success: false, error: 'Invalid ticket ID' });
    }

    const responses = await storage.getSupportResponsesByTicket(ticketId);
    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Error fetching ticket responses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket responses' });
  }
});

router.get('/responses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid response ID' });
    }

    const response = await storage.getSupportResponse(id);
    if (!response) {
      return res.status(404).json({ success: false, error: 'Response not found' });
    }

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching support response:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support response' });
  }
});

router.post('/responses', async (req, res) => {
  try {
    const data = insertSupportResponseSchema.parse(req.body);
    const response = await storage.createSupportResponse(data);
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error('Error creating support response:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create support response' });
  }
});

router.put('/responses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid response ID' });
    }

    const data = insertSupportResponseSchema.partial().parse(req.body);
    const response = await storage.updateSupportResponse(id, data);
    
    if (!response) {
      return res.status(404).json({ success: false, error: 'Response not found' });
    }

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error updating support response:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update support response' });
  }
});

router.delete('/responses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid response ID' });
    }

    const success = await storage.deleteSupportResponse(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Response not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting support response:', error);
    res.status(500).json({ success: false, error: 'Failed to delete support response' });
  }
});

// Knowledge Base Articles Routes
router.get('/knowledge-base', async (req, res) => {
  try {
    const { categoryId, status, limit } = req.query;
    const filter: any = {};
    
    if (categoryId) filter.categoryId = parseInt(categoryId as string);
    if (status) filter.status = status as string;
    if (limit) filter.limit = parseInt(limit as string);

    const articles = await storage.getKnowledgeBaseArticles(filter);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching knowledge base articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch knowledge base articles' });
  }
});

router.get('/knowledge-base/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }

    const article = await storage.getKnowledgeBaseArticle(id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Increment view count
    await storage.incrementArticleViewCount(id);

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching knowledge base article:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch knowledge base article' });
  }
});

router.get('/knowledge-base/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const article = await storage.getKnowledgeBaseArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Increment view count
    await storage.incrementArticleViewCount(article.id);

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching knowledge base article by slug:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch knowledge base article' });
  }
});

router.post('/knowledge-base', async (req, res) => {
  try {
    const data = insertKnowledgeBaseArticleSchema.parse(req.body);
    const article = await storage.createKnowledgeBaseArticle(data);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error('Error creating knowledge base article:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create knowledge base article' });
  }
});

router.put('/knowledge-base/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }

    const data = insertKnowledgeBaseArticleSchema.partial().parse(req.body);
    const article = await storage.updateKnowledgeBaseArticle(id, data);
    
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error updating knowledge base article:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update knowledge base article' });
  }
});

router.delete('/knowledge-base/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }

    const success = await storage.deleteKnowledgeBaseArticle(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge base article:', error);
    res.status(500).json({ success: false, error: 'Failed to delete knowledge base article' });
  }
});

router.post('/knowledge-base/:id/helpful', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }

    await storage.incrementArticleHelpfulCount(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking article as helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to mark article as helpful' });
  }
});

router.post('/knowledge-base/:id/not-helpful', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }

    await storage.incrementArticleNotHelpfulCount(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking article as not helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to mark article as not helpful' });
  }
});

// Live Chat Sessions Routes
router.get('/chat/sessions', async (req, res) => {
  try {
    const { status, assignedToUserId, limit } = req.query;
    const filter: any = {};
    
    if (status) filter.status = status as string;
    if (assignedToUserId) filter.assignedToUserId = parseInt(assignedToUserId as string);
    if (limit) filter.limit = parseInt(limit as string);

    const sessions = await storage.getLiveChatSessions(filter);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat sessions' });
  }
});

router.get('/chat/sessions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const session = await storage.getLiveChatSession(id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat session' });
  }
});

router.get('/chat/sessions/by-session-id/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await storage.getLiveChatSessionBySessionId(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching chat session by session ID:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat session' });
  }
});

router.post('/chat/sessions', async (req, res) => {
  try {
    const data = insertLiveChatSessionSchema.parse(req.body);
    const session = await storage.createLiveChatSession(data);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('Error creating chat session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create chat session' });
  }
});

router.put('/chat/sessions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const data = insertLiveChatSessionSchema.partial().parse(req.body);
    const session = await storage.updateLiveChatSession(id, data);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error updating chat session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to update chat session' });
  }
});

router.post('/chat/sessions/:id/end', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const success = await storage.endLiveChatSession(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({ success: false, error: 'Failed to end chat session' });
  }
});

// Live Chat Messages Routes
router.get('/chat/sessions/:sessionId/messages', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const messages = await storage.getLiveChatMessages(sessionId);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat messages' });
  }
});

router.get('/chat/messages/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid message ID' });
    }

    const message = await storage.getLiveChatMessage(id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error fetching chat message:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat message' });
  }
});

router.post('/chat/messages', async (req, res) => {
  try {
    const data = insertLiveChatMessageSchema.parse(req.body);
    const message = await storage.createLiveChatMessage(data);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error creating chat message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create chat message' });
  }
});

// Support Metrics Routes
router.get('/metrics', async (req, res) => {
  try {
    const { ticketId, sessionId, metricType } = req.query;
    const filter: any = {};
    
    if (ticketId) filter.ticketId = parseInt(ticketId as string);
    if (sessionId) filter.sessionId = parseInt(sessionId as string);
    if (metricType) filter.metricType = metricType as string;

    const metrics = await storage.getSupportMetrics(filter);
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching support metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support metrics' });
  }
});

router.post('/metrics', async (req, res) => {
  try {
    const data = insertSupportMetricSchema.parse(req.body);
    const metric = await storage.createSupportMetric(data);
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    console.error('Error creating support metric:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to create support metric' });
  }
});

// Support Stats Dashboard Route
router.get('/stats', async (req, res) => {
  try {
    const stats = await storage.getSupportStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch support stats' });
  }
});

export default router;