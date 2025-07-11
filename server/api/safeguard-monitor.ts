import { Router, Request, Response } from 'express';
import { getSafeguardStatus, getGenerationLog, clearGenerationLog } from '../config/generation-safeguards';

const router = Router();

// Get current safeguard status
router.get('/status', (req: Request, res: Response) => {
  const status = getSafeguardStatus();
  res.json({
    success: true,
    safeguards: status,
    timestamp: new Date().toISOString()
  });
});

// Get generation attempt log
router.get('/log', (req: Request, res: Response) => {
  const log = getGenerationLog();
  res.json({
    success: true,
    log,
    count: log.length,
    timestamp: new Date().toISOString()
  });
});

// Clear generation log (admin only)
router.post('/log/clear', (req: Request, res: Response) => {
  clearGenerationLog();
  res.json({
    success: true,
    message: 'Generation log cleared',
    timestamp: new Date().toISOString()
  });
});

export default router;