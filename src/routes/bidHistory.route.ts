import {Router} from 'express';

import {createBidHistory,getBidHistoryByTeam,getBidHistoryByAuction,getBidByPlayer} from '../controllers/bidHistory.controller';
import {BID_HISTORY_ROUTES} from '../constants/routes.constants';
import {verifyToken}from '../middleware/auth.middleware';

const router = Router();
router.post(BID_HISTORY_ROUTES.CREATE_BID_HISTORY,verifyToken,createBidHistory);
router.get(BID_HISTORY_ROUTES.GET_BID_BY_TEAMS,verifyToken,getBidHistoryByTeam);
router.get(BID_HISTORY_ROUTES.GET_BID_BY_AUCTION,verifyToken,getBidHistoryByAuction);
router.get(BID_HISTORY_ROUTES.GET_BID_BY_PLAYER,verifyToken,getBidByPlayer);
export default router;
