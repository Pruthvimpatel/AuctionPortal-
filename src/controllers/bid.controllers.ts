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

//place bid
export const placeBid = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
      return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND))
    }
    const {auctionId,teamId,bidAmount,startTime,endTime} = req.body;
    const auction = await db.Auction.findByPk(auctionId);
    if(!auction) {
        return next(new ApiError(404,ERROR_MESSAGES.AUCTION_NOT_FOUND))
    }

    const team = await db.Team.findByPk(teamId);
    if(!team) {
        return next(new ApiError(404,ERROR_MESSAGES.NO_TEAM_FOUND))
    }

    const bid = await db.Bid.create({
        auctionId,
        teamId,
        status: 'pending',
        bidAmount,
        startTime,
        endTime
    })

    const response = new ApiResponse(201,bid,SUCCESS_MESSAGES.BID_PLACED_SUCCESSFULLY);
    res.status(201).json(response);
});

//update bid status
export const updateBidStatus = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
 const user = req.user;

 if(!user){
    return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
}
const {bidId,status} = req.body;

if(!['pending','accepted','rejected'].includes(status)){
    return next(new ApiError(400,ERROR_MESSAGES.INVALID_STATUS));
}
try{
//Find and update the bid
const bid = await db.Bid.findByPk(bidId);
if(!bid){
    return next(new ApiError(400,ERROR_MESSAGES.NO_BID_FOUND));
}
bid.status = status
await bid.save();
const response = new ApiResponse(200,bid,SUCCESS_MESSAGES.BID_STATUS_UPDATED_SUCCESSFULLY);
res.status(200).json(response);
} catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
});

//Fetch all bids for a specific auction.
export const getBidsForAuction = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
 const user = req.user;

 if(!user){
    return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
 }

 const {auctionId} = req.params;
 const page = parseInt(req.query.page as string) || 1;
 const limit = parseInt(req.query.limit as string) || 10;
 const offset = (page - 1) * limit;

 const { sortBy = 'createdAt', sortOrder = 'DESC', search = '' } = req.query;

 const searchFilter = search
 ? {
     [Op.or]: [
       { bidAmount: { [Op.like]: `%${search}%` } },
       Sequelize.where(Sequelize.cast(Sequelize.col('status'), 'TEXT'), {
        [Op.like]: `%${search}%`,
      }),
     ],
   }
 : {};

 const validSortColumns = ['bidAmount', 'status', 'createdAt'];
 const validSortOrders = ['ASC', 'DESC'];
 const orderBy = validSortColumns.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
 const order = validSortOrders.includes(sortOrder as string) ? (sortOrder as string) : 'DESC';


 try {
     const { rows: bids, count: totalBids } = await db.Bid.findAndCountAll({
      where: {
        auctionId,
        ...searchFilter,
      },
      limit,
      offset,
      order: [[orderBy, order]],
    });
    
    if(!bids) {
        return next(new ApiError(404,ERROR_MESSAGES.NO_BID_FOUND))
    }
const totalPages = Math.ceil(totalBids / limit);
const response = new ApiResponse(
    200,
    {
      bids,
      pagination: {
        totalBids,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    },
    SUCCESS_MESSAGES.BIDS_FETCHED_SUCCESSFULLY
  );res.status(200).json(response);
 }catch(error){
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
 }
});

//Fetch a specific bid by its ID
export const getBidById = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => { 
    const {bidId} = req.params
    try {
        const bid = await db.Bid.findByPk(bidId)

        if(!bid) {
            return next(new ApiError(404,ERROR_MESSAGES.NO_BID_FOUND))
        }
    const response = new ApiResponse(200,bid,SUCCESS_MESSAGES.BIDS_FETCHED_SUCCESSFULLY);
    res.status(200).json(response);
    } catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
});

