import {Router} from 'express';
import {placeBid,updateBidStatus,getBidsForAuction,getBidById} from '../controllers/bid.controllers';
import {BID_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';
import {placeBidSchema,updateBidStatusSchema} from '../validations/bid';

const router = Router();
router.post(BID_ROUTES.BID,verifyToken,validateReq(placeBidSchema),placeBid);
router.post(BID_ROUTES.BID_STATUS,verifyToken,validateReq(updateBidStatusSchema),updateBidStatus);
router.get(BID_ROUTES.GET_ALL,verifyToken,getBidsForAuction);
router.get(BID_ROUTES.GET,verifyToken,getBidById);
export default router;


