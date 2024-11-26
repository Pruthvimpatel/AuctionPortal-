import {Router} from 'express';
import {getAdminStatistics} from '../controllers/admin.controller';
import {ADMIN_ROUTES} from '../constants/routes.constants';
import {verifyToken}from '../middleware/auth.middleware';

const router = Router();

router.get(ADMIN_ROUTES.ADMIN_STATISTICS, verifyToken, getAdminStatistics);

export default router;