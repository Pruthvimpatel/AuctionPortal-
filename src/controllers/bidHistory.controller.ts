import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';

import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { Op, Sequelize } from 'sequelize';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

//create Bid History
export const createBidHistory = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const { auctionId, teamId, playerId, bidAmount } = req.body;

    if(!auctionId ||!teamId ||!playerId ||!bidAmount) {
        return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {

        const newBidHistory = await db.BidHistory.create({
            auctionId,
            teamId,
            playerId,
            bidAmount
        })
        if(!newBidHistory) {
            return next(new ApiError(401,ERROR_MESSAGES.NO_BID_HISTORY_FOUND));
        }
        const response = new ApiResponse(201,newBidHistory,SUCCESS_MESSAGES.BID_HISTORY_CREATED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch(error) {
        console.log(error);
        return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
})

 //Get Bid History by Team
 export const getBidHistoryByTeam  = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
     const user = req.user;
     if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
     }
    const {teamId} = req.params;
    if(!teamId) {
        return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
    
      const bidHistory = await db.BidHistory.findAll({
        where: {
            teamId
        }
      });
      
      if(!bidHistory) {
        return next(new ApiError(401,ERROR_MESSAGES.NO_BID_HISTORY_FOUND));
      }

    const response = new ApiResponse(200,bidHistory,SUCCESS_MESSAGES.BID_HISTORY_RETRIEVED)
    res.status(200).json(response);
    }catch(error) {
        console.log(error);
        return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
 })

 //Get Bid History by auction
 export const getBidHistoryByAuction  = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
       return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
   const {auctionId} = req.params;
   if(!auctionId) {
       return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
   }
   try {
   
     const bidHistory = await db.BidHistory.findAll({
       where: {
        auctionId
       }
     });
     if(!bidHistory) {
       return next(new ApiError(401,ERROR_MESSAGES.NO_BID_HISTORY_FOUND));
     }

   const response = new ApiResponse(200,bidHistory,SUCCESS_MESSAGES.BID_HISTORY_RETRIEVED)
   res.status(200).json(response);
   }catch(error) {
       console.log(error);
       return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
})

//Getting All Bids of a Player
export const getBidByPlayer = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {  
    const user = req.user;
    if(!user) {
       return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
   const {playerId} = req.params;
   
   if(!playerId) {
    return next(new ApiError(401,ERROR_MESSAGES.PLAYERID_NOT_FOUND))
   }
   try {

    const bids = await db.BidHistory.findAll({
        where: {
            playerId
        },
        include: [
            {
                model: db.Auction,
            },
            {
                model: db.Team,
            }
        ]
    });

    console.log("bid",bids)
    if(!bids) {
        return next(new ApiError(401,ERROR_MESSAGES.NO_BID_HISTORY_FOUND));
    }

    const response = new ApiResponse(200,bids,SUCCESS_MESSAGES.BID_HISTORY_RETRIEVED)
    res.status(200).json(response);

   }catch(error) {
    console.log(error);
    return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
})

