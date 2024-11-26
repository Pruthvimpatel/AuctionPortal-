import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';

import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { Op } from 'sequelize';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };


 //create a team 
 export const createTeam = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
     const user = req.user;
     if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
     }

     const {name,userId,logo} = req.body;

     if(!name || !userId || !logo) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
     }
     try {
     const newTeam = await db.Team.create({
         name,
         userId,
         logo
     })
     const response = new ApiResponse(201,newTeam,SUCCESS_MESSAGES.TEAM_CREATED_SUCCESSFULLY);
     res.status(201).json(response);
    }catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
 
    }
 })

 //get all teams
 export const getAllTeams = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
 const page = parseInt(req.query.page as string) || 1;
 const limit = parseInt(req.query.limit as string) || 10;
 const offset = (page - 1) * limit;
 const { sortBy = 'name', sortOrder = 'ASC', search = '' } = req.query;

 const searchFilter = search ? {
    [Op.or]: [
      { name: { [Op.like]: `%${search}%` } },
    ]
  } : {};

  const validSortColumns = ['name'];
  const validSortOrders = ['ASC', 'DESC'];

  const orderBy = validSortColumns.includes(sortBy as string) ? (sortBy as string) : 'name';
  const order = validSortOrders.includes(sortOrder as string) ? (sortOrder as string) : 'ASC';


    try {
const { rows: team, count: totalTeams } = await db.Team.findAndCountAll({
        where: searchFilter,
        limit,
        offset,
        order: [[orderBy, order]],
      });     
      
      const totalPages = Math.ceil(totalTeams / limit); 
       if(!team) {
        return next(new ApiError(404,ERROR_MESSAGES.TEAMS_NOT_FOUND));
       }

       const response = new ApiResponse(200, {
        team,
        pagination: {
          totalTeams,
          totalPages,
          currentPage: page,
          pageSize: limit,
        }
      }, SUCCESS_MESSAGES.TOURNAMENT_FETCHED_SUCCESSFULLY);
    res.status(200).json(response);

    } catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }


 })

 //get team details
 export const getTeamDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    const {teamId} = req.params;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
   if(!teamId) {
    return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
   }
   
   try {
    const teamDetails = await db.Team.findOne({
        where: {
            id:teamId
        }
    });
    if(!teamDetails){
        return next(new ApiError(400,ERROR_MESSAGES.NO_TEAM_FOUND));
    }
const response = new ApiResponse(200,teamDetails,SUCCESS_MESSAGES.TEAM_DETAILS_FETCHED_SUCCESSFULLY);
res.status(200).json(response);

   } catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
 })

 //update team details
 export const updateTeamDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    const {teamId} = req.params;
    const {name,logo} = req.body;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    if(!teamId || !name || !logo) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
        const updateTeamDetails = await db.Team.findByPk(teamId);
        if(!updateTeamDetails){
            return next(new ApiError(400,ERROR_MESSAGES.NO_TEAM_FOUND));
        }
        updateTeamDetails.name = name;
        updateTeamDetails.logo = logo;
        await updateTeamDetails.save();
        const response = new ApiResponse(200,updateTeamDetails,SUCCESS_MESSAGES.TEAM_DETAILS_UPDATED_SUCCESSFULLY);

        res.status(200).json(response);
    } catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }

 });

 //delete team 
 export const deleteTeam = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    const {teamId} = req.params;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    if(!teamId) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
        const teamDetails = await db.Team.findByPk(teamId);
        if(!teamDetails){
            return next(new ApiError(400,ERROR_MESSAGES.NO_TEAM_FOUND));
        }
        await teamDetails.destroy();
        const response = new ApiResponse(200,teamDetails,SUCCESS_MESSAGES.TEAM_DELETED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
 });

 //add player add team
 export const addPlayerToTeam = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
  const user = req.user;
  if(!user) {
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
  }
const {teamId} = req.params;
const {playerId} = req.body;

if(!teamId || !playerId) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
}
try {
    const team = await db.Team.findByPk(teamId);
    if(!team) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_TEAM_FOUND));
    }

    const player = await db.Player.findAll({
        where: {
            id:playerId
        }
    })

    await db.Player.update(
        {teamId},
        {
            where: {
                id:playerId
            },
        }
    );

    const response = new ApiResponse(200,player,SUCCESS_MESSAGES.PLAYER_ADDED_TO_TEAM_SUCCESSFULLY);
    res.status(200).json(response);
} catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}

 });

 