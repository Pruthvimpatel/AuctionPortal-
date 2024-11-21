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


//start auction
export const startAuction = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
  const user = req.user;
  if(!user) {
    return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND))
  }

  const {tournamentId,startTime,endTime,bidAmount,playerId} = req.body;

  if(!tournamentId || !startTime ||!endTime ||!bidAmount ||!playerId) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED))
  }
  try {

    //check if any tournament exists
    const tournament = await db.Tournament.findByPk(tournamentId)
    if(!tournament) {
        return next(new ApiError(404,ERROR_MESSAGES.NO_TOURNAMENT_FOUND))
    }
    const auction = await db.Auction.create({
        tournamentId,
        startTime,
        endTime,
        bidAmount,
        status: 'pending',
        playerId
    });

    const response = new ApiResponse(201,auction,SUCCESS_MESSAGES.AUCTION_START_SUCCESSFULLY);
    res.status(201).json(response);
  }catch(error){
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR))
  }
});

//live auction
export const liveAuction = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
        return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND))
    }
    
    try {
        const liveAuction = await db.Auction.findOne({
            where: {
                status: 'pending'
            },
            include: [
                {
                    model: db.Player,
                },
            ],
        });

        if(!liveAuction) {
            return next(new ApiError(400,ERROR_MESSAGES.NO_LIVE_AUCTION_FOUND))
        }

       const highestBid = await db.Bid.findOne({
        where: {
            auctionId: liveAuction.id,
        },
        order: [['bidAmount', 'DESC']],
       });

       res.status(200).json({
        message: 'Live auction details fetched successfully.',
        liveAuction,
        highestBid,
      });
    } catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR))
    }

});

//End Auction for a Specific Player
export const endAuction = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
   const user = req.user;
   if(!user) {
     return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
   }

   const {auctionId} = req.body;

   try {
    const auction = await db.Auction.findByPk(auctionId);
    
    if(!auction) {
        return next(new ApiError(404,ERROR_MESSAGES.AUCTION_NOT_FOUND));
    }
    if(auction.status !== 'pending') {
        return next(new ApiError(400, ERROR_MESSAGES.AUCTION_ALREADY_ENDED));
    }
  const highestBid = await db.Bid.findOne({
    where: {
        auctionId,
    },
    order: [['bidAmount', 'DESC']],
  });
    if(!highestBid) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_HIGHEST_BID_FOUND));
    }

    auction.status = 'accepted';
    await auction.save();

    highestBid.status = 'accepted';
    await highestBid.save();

    const response = new ApiResponse(200, auction, SUCCESS_MESSAGES.AUCTION_END_SUCCESSFULLY);
    res.status(200).json(response);
   } catch(error) {
    console.log(error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
});

//Get detailed information about a specific auction.
export const getAuctionDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
const user = req.user;
 if(!user) {
    return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
  }
  const {auctionId} = req.params;

  try {
    const auction = await db.Auction.findOne({
    where: {
      id: auctionId,
    },
    include: [
      {
        model:db.Player
      },
      {
        model: db.Tournament
      },
      {
        model: db.Bid,
        order: [['bidAmount', 'DESC']]
      },
    ],
    });

    if(!auction) {
      return next(new ApiError(404,ERROR_MESSAGES.AUCTION_NOT_FOUND));
    }

    const response = new ApiResponse(200,auction,SUCCESS_MESSAGES.AUCTION_DETAILS_FETCHED)
    res.status(200).json(response);
  } catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }
});


//get-top bidders
export const getTopBidders = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
  const user = req.user;
  if(!user) {
    return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {
    const topBidders = await db.User.findAll({
      attributes: ['id','name',[db.sequelize.fn('COUNT',db.sequelize.col('Bids.id')),'totalBids']],
      include: [{model: db.Bid, attributes: []}],
      group: ['User.id'],
      order: [[db.sequelize.literal('totalBids'), 'DESC']],
      limit: 10,
    });

    const response = new ApiResponse(200,topBidders,SUCCESS_MESSAGES.TOP_BIDDERS_FETCHED)
    res.status(200).json(response);
  } catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }
});