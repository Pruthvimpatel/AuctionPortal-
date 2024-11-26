import {Router} from 'express';
import {createTeam,getAllTeams,getTeamDetails,updateTeamDetails,deleteTeam,addPlayerToTeam} from '../controllers/team.controller';
import {TEAM_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';

const router = Router();
router.post(TEAM_ROUTES.CREATE,verifyToken,createTeam);
router.get(TEAM_ROUTES.GET_ALL,verifyToken,getAllTeams); 
router.get(TEAM_ROUTES.GET_DETAILS,verifyToken,getTeamDetails);
router.post(TEAM_ROUTES.UPDATE_DETAILS,verifyToken,updateTeamDetails);
router.delete(TEAM_ROUTES.DELETE,verifyToken,deleteTeam);
router.post(TEAM_ROUTES.ADD_PLAYER,verifyToken,addPlayerToTeam);

export default router
