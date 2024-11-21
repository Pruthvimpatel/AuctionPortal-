import {Router} from 'express';
import {registerOwner,getAllOwners,getOwnerDetails,updateOwnerDetails,deleteOwner,assignTeam,updateOwnerPoint} from '../controllers/owner.controller'
import {OWNER_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/authorization.middleware';
import {validateReq} from '../middleware/validation';
import {registerOwnerSchema,updateOwnerSchema,assignTeamSchema,updatePointsSchema} from '../validations/owner';

const router = Router();
router.post(OWNER_ROUTES.OWNER_REGISTRATION,verifyToken,validateReq(registerOwnerSchema),registerOwner);
router.get(OWNER_ROUTES.GET_ALL,verifyToken,getAllOwners);
router.get(OWNER_ROUTES.GET_DETAILS,verifyToken,getOwnerDetails);
router.put(OWNER_ROUTES.UPDATE_DETAILS,verifyToken,validateReq(updateOwnerSchema),updateOwnerDetails);
router.delete(OWNER_ROUTES.DELETE,verifyToken,deleteOwner);
router.put(OWNER_ROUTES.ASSIGN,verifyToken,validateReq(assignTeamSchema),assignTeam);
router.post(OWNER_ROUTES.UPDATE_POINTS,verifyToken,authorizeRole(['admin']),validateReq(updatePointsSchema),updateOwnerPoint)
export default router;