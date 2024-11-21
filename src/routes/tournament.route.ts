import {Router} from 'express';
import {createTournament,getAllTournament,getTournamentDetails,updateTournamentDetails,deleteTournamentDetails} from '../controllers/tournament.controller'
import {TOURNAMENT_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';
import {createTournamentSchema} from '../validations/tournament';

const router = Router();
router.post(TOURNAMENT_ROUTES.TOURNAMENT_REGISTRATION,verifyToken,createTournament);
router.get(TOURNAMENT_ROUTES.GET_ALL,verifyToken,getAllTournament);
router.get(TOURNAMENT_ROUTES.GET_DETAILS,verifyToken,getTournamentDetails);
router.post(TOURNAMENT_ROUTES.UPDATE_DETAILS,verifyToken,updateTournamentDetails);
router.post(TOURNAMENT_ROUTES.DELETE,verifyToken,deleteTournamentDetails);
export default router;