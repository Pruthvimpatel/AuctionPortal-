import {Router} from 'express';
import {startAuction,liveAuction,endAuction,getAuctionDetails,getTopBidders} from '../controllers/auction.controller';
import {AUCTION_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';
import {startAuctionSchema,endAuctionSchema} from '../validations/auction'

const router = Router();
router.post(AUCTION_ROUTES.START,verifyToken,validateReq(startAuctionSchema),startAuction);
router.get(AUCTION_ROUTES.LIVE_AUCTION,verifyToken,liveAuction);
router.post(AUCTION_ROUTES.END_AUCTION,verifyToken,validateReq(endAuctionSchema),endAuction);
router.get(AUCTION_ROUTES.AUCTION_DETAILS,verifyToken,getAuctionDetails);
router.get(AUCTION_ROUTES.TOP_BIDDERS,verifyToken,getTopBidders);
export default router;


