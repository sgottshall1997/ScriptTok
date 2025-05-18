import { Router } from 'express';
import { userAnalyticsRouter } from './user';

const router = Router();

// Include user analytics endpoint
router.use('/user', userAnalyticsRouter);

export { router as analyticsRouter };