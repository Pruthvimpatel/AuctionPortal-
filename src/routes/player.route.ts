import {Router} from 'express';
import {playerRegistration,getAllPlayers,getPlayerDetails,updatePlayerDetails,deletePlayer,profilePicture} from '../controllers/player.controller'
import {PLAYER_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';
import {playerRegistrationSchema,updatePlayerDetailsSchema,deletePlayerSchema} from '../validations/player';
import upload from '../middleware/multer.middleware';


const router = Router();
router.post(PLAYER_ROUTES.PLAYER_REGISTRATION,verifyToken,validateReq(playerRegistrationSchema),playerRegistration);

router.get(PLAYER_ROUTES.GET_ALL,verifyToken, getAllPlayers);

router.get(PLAYER_ROUTES.GET_DETAILS,verifyToken,getPlayerDetails);

router.put(PLAYER_ROUTES.UPDATE_DETAILS,verifyToken,validateReq(updatePlayerDetailsSchema),updatePlayerDetails);

router.delete(PLAYER_ROUTES.DELETE,verifyToken,validateReq(deletePlayerSchema), deletePlayer);

router.post(PLAYER_ROUTES.UPLOAD_PROFILE,verifyToken,upload.single('profilePicture'),profilePicture)

export default router;