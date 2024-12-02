import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import logger from '../logger';

import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';


interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };


//admin-dashboard
 export const getAdminStatistics = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
     const user = req.user;
     if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
     }
     try {
    //Fetch total Player
    const totalPlayers = await db.Player.count();

    //Fetch total Teams
    const totalTeams  = await db.Team.count();
 
    //Fetch teams participant in Tournament
    const teamsInTournament = await db.TeamTournament.findAll({
        attributes:[
            'tournamentId',
            [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('team_id'))), 'teamCount'],
        ],
        group: ['tournamentId'],
    });

      const tournamentTeamStats = teamsInTournament.map((entry: any) => ({
        tournamentId: entry.tournamentId,
        teamCount: entry.dataValues.teamCount,
      }));

      const statistics = {
        totalPlayers,
        totalTeams,
        tournamentTeamStats,
      };

      const response = new ApiResponse(200,statistics,SUCCESS_MESSAGES.ADMIN_STATISTICS_FETCHED_SUCCESSFULLY);
      res.status(200).json(response);
      } catch(error) {
        logger.error(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
     }

});


