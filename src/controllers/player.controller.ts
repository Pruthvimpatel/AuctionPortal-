import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import uploadOnCloudinary from '../utils/cloudinary';

import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { Op } from 'sequelize';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

//Player registration
 export const playerRegistration = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
     const {name,age,role,teamId,basePrice,gender,battingOrder,battingHand,bowlingHand,skillRating} = req.body;
     console.log(req.body)

     if(!name || !age || !role || !teamId || !basePrice ||!gender || !battingOrder || !battingHand || !bowlingHand || !skillRating) {
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
            basePrice,
            gender,
            battingOrder,
            battingHand,
            bowlingHand,
            skillRating
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

//Fetch details of a specific player.
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
const {playerId,name,age,role,basePrice,gender,battingOrder,battingHand,bowlingHand,skillRating} = req.body;
const user = req.user;

if(!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
}

if(!playerId || !name ||!age ||!role ||!basePrice || !gender ||!battingOrder ||!battingHand || !bowlingHand ||!skillRating) {
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
    player.gender = gender;
    player.battingOrder = battingOrder;
    player.battingHand = battingHand;
    player.bowlingHand = bowlingHand;
    player.skillRating = skillRating;

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

//upload profile picture
export const profilePicture = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction):Promise<void> => {
    const { id } = req.params;
    const profilePicture = req.file?.path;
    const user = req.user;

    if(!user){
        return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
    }

    if(!profilePicture) {
        return next(new ApiError(404, ERROR_MESSAGES.FILE_REQUIRED)); 
    }

    const player = await db.Player.findByPk(id);
    if (!player) {
        return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
    }
    try {
        const profile = await uploadOnCloudinary(profilePicture);
        if(!profile || !profile.url) {
          return next(new ApiError(404, ERROR_MESSAGES.PROFILE_UPLOAD_FAILED));
        }
      
        player.profilePicture = profile.url;
        await player.save();
      
        res.status(200).json(new ApiResponse(200,user,SUCCESS_MESSAGES.PROFILE_UPLOAD_SUCCESSFULLY));
        return;
    }catch(error) {
        console.log(error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }


});