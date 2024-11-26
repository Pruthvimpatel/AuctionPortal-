import {Router} from 'express';
import {createTournament,getAllTournament,getTournamentDetails,updateTournamentDetails,deleteTournamentDetails,addTeamToTournament,getTeamsInTournament,getTournamentsForTeam,updateTeamTournament} from '../controllers/tournament.controller'
import {TOURNAMENT_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {validateReq} from '../middleware/validation';

const router = Router();
router.post(TOURNAMENT_ROUTES.TOURNAMENT_REGISTRATION,verifyToken,createTournament);
router.get(TOURNAMENT_ROUTES.GET_ALL,verifyToken,getAllTournament);
router.get(TOURNAMENT_ROUTES.GET_DETAILS,verifyToken,getTournamentDetails);
router.post(TOURNAMENT_ROUTES.UPDATE_DETAILS,verifyToken,updateTournamentDetails);
router.post(TOURNAMENT_ROUTES.DELETE,verifyToken,deleteTournamentDetails);
router.post(TOURNAMENT_ROUTES.ADD_TEAM,verifyToken,addTeamToTournament);
router.get(TOURNAMENT_ROUTES.GET_TEAMS,verifyToken,getTeamsInTournament);
router.get(TOURNAMENT_ROUTES.GET_TOURNAMENTS,verifyToken,getTournamentsForTeam);
router.post(TOURNAMENT_ROUTES.UPDATE_TEAM_TOURNAMENTS,verifyToken,updateTeamTournament)
export default router;