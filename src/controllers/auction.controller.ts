import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import fs from 'fs';
import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { createObjectCsvWriter } from 'csv-writer';
import { sendEmail } from '../utils/mailer';
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
                    as: 'player',
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
    include: [{model: db.User, attributes:['email']}],
  });
    if(!highestBid ||!highestBid.User) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_HIGHEST_BID_FOUND));
    }

    auction.status = 'accepted';
    await auction.save();

    highestBid.status = 'accepted';
    await highestBid.save();


    //send email to the highest bidder
    const emailSubject = 'Auction Won Notification';
    const emailBody = `Congratulations! You have won the auction for Auction ID: ${auctionId}. Your bid amount was ${highestBid.bidAmount}.`;
    console.log(`Sending email to: ${highestBid.User.email}`);
    console.log(`Email Subject: ${emailSubject}`);
    console.log(`Email Body: ${emailBody}`);
    await sendEmail({
      to: highestBid.User.email,
      subject: emailSubject,
      text: emailBody,
    }); 

  
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
        model:db.Player,
        as: 'player',
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

//Export auction data to a CSV file.
export const exportAuctionData = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
  const user = req.user;
  if(!user) {
    return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {
   //fetching auction data
   const auction = await db.Auction.findAll({
    attributes: ['id', 'tournamentId', 'startTime', 'endTime', 'bidAmount', 'status', 'playerId'],
   });

   if(!auction) {
    return next(new ApiError(404,ERROR_MESSAGES.AUCTION_NOT_FOUND));
   }

   //define  CSV file path
   const filePath = './exports/auction-data.csv';

   //creating CSV file
   const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      {id: 'id', title: 'Auction ID'},
      {id: 'tournamentId', title: 'Tournament ID'},
      {id:'startTime', title: 'Start Time'},
      {id: 'endTime', title: 'End Time'},
      {id: 'bidAmount', title: 'Bid Amount'},
      {id:'status', title: 'Status'},
      {id: 'playerId', title: 'Player ID'},
    ],
   });

   //writing data to CSV file
   await csvWriter.writeRecords(
    auction.map((auction) => ({
      id:auction.id,
      tournamentId: auction.tournamentId,
      startTime: auction.startTime,
      endTime: auction.endTime,
      bidAmount: auction.bidAmount,
      status: auction.status,
      playerId: auction.playerId,
    }))
   );

   const response = new ApiResponse(200,{},SUCCESS_MESSAGES.AUCTION_EXPORT_SUCCESS);
   res.status(200).send(response);
   
  }catch(error){
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }
});

//Download exported CSV file
export const downloadExportedAuctionData = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
  const user = req.user;
  if(!user) {
    return next(new ApiError(404,ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {

    const filePath = './exports/auction-data.csv';

    if(!fs.existsSync(filePath)) {
      return next(new ApiError(404,ERROR_MESSAGES.EXPORTED_DATA_NOT_FOUND));
    }
    //Download the file
    res.download(filePath,'auction-data.csv',(err)=> {
      if(err) {
        console.log(err);
        return next(new ApiError(500,ERROR_MESSAGES.FILE_DOWNLOAD_ERROR));
      }

      fs.unlinkSync(filePath);
    });
  }catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }
});
