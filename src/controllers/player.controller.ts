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

//Player registration
 export const playerRegistration = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
     const {name,age,role,teamId,basePrice} = req.body;

     if(!name || !age || !role || !teamId || !basePrice) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
     }

     try {
        const existingPlayer = await db.Player.findOne({
            where: {name, teamId}
        });

        if(existingPlayer) {
            return next(new ApiError(400, ERROR_MESSAGES.PLAYER_ALREADY_EXISTS));
        }
        const newPlayer =await db.Player.create({
            name,
            age,
            role,
            teamId,
            basePrice
        });

        const response = new ApiResponse(201,newPlayer,SUCCESS_MESSAGES.PLAYER_REGISTER_SUCCESSFULLY);
        res.status(200).send(response);
     }catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
     }
 });


 //get-all Players
 export const getAllPlayers = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {   
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

  const validSortColumns = ['name', 'role', 'team'];
  const validSortOrders = ['ASC', 'DESC'];

  const orderBy = validSortColumns.includes(sortBy as string) ? (sortBy as string) : 'name';
  const order = validSortOrders.includes(sortOrder as string) ? (sortOrder as string) : 'ASC';

  try {
    const { rows: player, count: totalPlayers } = await db.Player.findAndCountAll({
        where: searchFilter,
        include: [
          {
            model: db.Team,
          },
        ],
        limit,
        offset,
        order: [[orderBy, order]],
      });
    const totalPages = Math.ceil(totalPlayers / limit);
    const response = new ApiResponse(200, {
        player,
        pagination: {
          totalPlayers,
          totalPages,
          currentPage: page,
          pageSize: limit
        }
      }, SUCCESS_MESSAGES.ALL_PLAYERS_FETCHED_SUCCESSFULLY);    res.status(200).send(response);
  } catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }

 });

//Fetch det ails of a specific player.
export const getPlayerDetails  = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
const user = req.user;
const {playerId} = req.params;
if(!user) {
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
}

try {
    const player = await db.Player.findOne({
        where: {id:playerId},
        include: [
            {
                model: db.Team
            }
        ]
    });

    if(!player) {
        return next(new ApiError(404,ERROR_MESSAGES.PLAYER_NOT_FOUND));
    }
    const response = new ApiResponse(200,player,SUCCESS_MESSAGES.PLAYER_DETAILS_FETCHED_SUCCESSFULLY);
    res.status(200).send(response);
} catch (error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
});

//Update player details.
export const updatePlayerDetails = asyncHandler(async(req:MyUserRequest,res:Response,next: NextFunction) => {
const {playerId,name,age,role,basePrice} = req.body;
const user = req.user;

if(!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
}

if(!playerId || !name ||!age ||!role ||!basePrice) {
    return next(new ApiError(400, ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
}

try {
    const player = await db.Player.findByPk(playerId);
    if(!player) {
        return next(new ApiError(404, ERROR_MESSAGES.PLAYER_NOT_FOUND));
    }

    player.age = age;
    player.name = name;
    player.role = role;
    player.basePrice = basePrice;

    await player.save();
    const response = new ApiResponse(200,player, SUCCESS_MESSAGES.PLAYER_DETAILS_UPDATED_SUCCESSFULLY);
    res.status(200).send(response);
} catch(error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
}
});

//Delete a player.
export const deletePlayer = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
const {playerId} = req.body;
const user = req.user;
if(!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
}
if(!playerId) {
    return next(new ApiError(400,ERROR_MESSAGES.PLAYERID_NOT_FOUND))
}

try {
    const player = await db.Player.findOne({
        where: {
            id:playerId

        }
    })
    if(!player) {
    return next(new ApiError(404,ERROR_MESSAGES.PLAYER_NOT_FOUND));
    }
    await player.destroy();
    const response = new ApiResponse(200,player,SUCCESS_MESSAGES.PLAYER_DELETED_SUCCESSFULLY);
    res.status(200).send(response); 
}catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
});