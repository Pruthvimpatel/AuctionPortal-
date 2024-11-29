import {Server, Socket} from 'socket.io';
import db from '../sequelize-client';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';

interface StartAuctionData {
  tournamentId: string;
  startTime: string;
  endTime: string;
  bidAmount: string;
  playerId: string;
}

interface PlaceBidData {
  playerId: string;
  userId: string;
  teamId:string;
  bidAmount: string;
}

interface EndAuctionData {
  auctionId: string;
}


export default function AuctionSocket(io: Server) {
    io.on('connection',(socket: Socket) => {
        console.info('New client connected',socket.id);
        
    //Handling starting an auction
    socket.on('startAuction',async(data:StartAuctionData)=> {
        const { tournamentId, startTime, endTime, bidAmount, playerId } = data;
        try {
            if (!tournamentId || !startTime || !endTime || !bidAmount || !playerId) {
                socket.emit('errorMessage', ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
                return;
              }

         //check if the tournament exists 
         const tournament = await db.Tournament.findByPk(tournamentId);
         if (!tournament) {
           socket.emit('errorMessage', ERROR_MESSAGES.NO_TOURNAMENT_FOUND);
           return;
         }

         //check player exists
         const player = await db.Player.findByPk(playerId);
         if (!player) {
            socket.emit('errorMessage', ERROR_MESSAGES.PLAYERID_NOT_FOUND);
            return;
         }

         //create the auction in db
         const auction = await db.Auction.create({
            tournamentId,
            startTime,
            endTime,
            bidAmount,
            status: 'pending',
            playerId
          });

          //Fetch auction with player details for broadcasting
         const auctionWithPlayer = await db.Auction.findByPk(auction.id, {
          include: [
            {
              model: db.Player,
              as: 'player', 
              attributes: ['id', 'name', 'age', 'role', 'profilePicture', 'skillRating'],
            },
          ],
        });

          // Emit a success response to the client
        socket.emit('auctionStarted', {
            message: SUCCESS_MESSAGES.AUCTION_START_SUCCESSFULLY,
            auction:auctionWithPlayer,
          });

           // Optionally, you can broadcast this information to other clients if needed
        io.emit('auctionUpdate', {
          auction: auctionWithPlayer,
          });
  
        }catch(error) {
        console.error('Error starting auction:', error);
        socket.emit('errorMessage', ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    });

    //Handling placing a bid on a player

    socket.on('placeBid',async(data:PlaceBidData)=> {
      const {playerId,userId,teamId,bidAmount} = data;
      try {
        if (!playerId || !userId || !bidAmount) {
          socket.emit('errorMessage', ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
          return;
        }


        //check if the player exists
       const player = await db.Player.findByPk(playerId);
       if(!player)
       {
        socket.emit('errorMessage',ERROR_MESSAGES.PLAYERID_NOT_FOUND);
        return;
       }


       //check if the user
       const user = await db.User.findByPk(userId)
       if (!user) {
        socket.emit('errorMessage', ERROR_MESSAGES.USER_NOT_FOUND);
        return;
      }

      if (parseFloat(bidAmount) <= 0) {
        socket.emit('errorMessage', ERROR_MESSAGES.INVALID_BID_AMOUNT);
        return;
      }

     //check if the auction is active
     const auction = await db.Auction.findOne({
      where: {
        playerId,
        status: 'pending',
      }
     })
     if(!auction) {
       socket.emit('errorMessage', ERROR_MESSAGES.AUCTION_NOT_FOUND);
       return;
     }

const team = await db.Team.findByPk(teamId);
if (!team) {
  socket.emit('errorMessage', ERROR_MESSAGES.TEAMS_NOT_FOUND);
  return;
}

     //place a bid
     const bid = await db.Bid.create({
      auctionId: auction.id,
      userId,
      bidAmount,
      playerId: player.id, 
      teamId: team.id,
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 3600000).toISOString(),
      status: 'pending',
     })


     //Fetch the updated auction details
     const auctionWithBids = await db.Auction.findByPk(auction.id, {
      include: [
        {
          model: db.Player,
          as: 'player', 
          attributes: ['id', 'name', 'age', 'role', 'profilePicture', 'skillRating'],
        },
        {
         model: db.Bid,
         include: [
          {
            model: db.User,
            attributes: ['id','email','userName']
          }
         ]
        }
      ]
     });

     // Emit the new bid and auction update to the client
     socket.emit('bidPlaced', {
        message: SUCCESS_MESSAGES.BID_PLACED_SUCCESSFULLY,
        bid,
        auction: auctionWithBids,
      });
      io.emit('auctionUpdate', {
        auction: auctionWithBids,
      });
      }catch(error) {
        console.error('Error placing bid:', error);
        socket.emit('errorMessage', ERROR_MESSAGES.INTERNAL_SERVER_ERROR);

      }
    })

    //ending Auction for a specific player
    socket.on('endAuctionforPlayer',async(data:EndAuctionData) => {
      const {auctionId} = data;
      try {
        if(!auctionId) {
          socket.emit('errorMessage', ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
          return;
        }

        //Fetch the auction by ID
        const auction = await db.Auction.findByPk(auctionId);
        if(!auction) {
          socket.emit('errorMessage', ERROR_MESSAGES.AUCTION_NOT_FOUND);
          return;
        }
        
        //fetch the highest bid and the wining team
         const highestBid = await db.Bid.findOne({
          where: {
            auctionId,
          },
          order: [['bidAmount', 'DESC']],
        });

        if(!highestBid) {
          socket.emit('errorMessage', ERROR_MESSAGES.NO_BID_FOUND);
          return;
        }

        const team = await db.Team.findByPk(highestBid.teamId);
        if(!team) {
          socket.emit('errorMessage', ERROR_MESSAGES.TEAMS_NOT_FOUND);
          return;
        }


        //set auction status 
        auction.status = 'accepted';
        await auction.save();


        socket.emit('auctionEndedForPlayer', {
          message: SUCCESS_MESSAGES.AUCTION_END_SUCCESSFULLY,
          auction: {
            ...auction.toJSON(),
            highestBid: {
              bidAmount: highestBid.bidAmount,
              teamName: team.name,
              playerDetails: highestBid.playerId,
            }
          }
        })
        io.emit('autionUpdated', {
          auction:auction,
          highestBid: highestBid,
          team: team,
        });
      } catch(error) {
        console.error('Error ending auction:', error);
        socket.emit('errorMessage', ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }
    })
   

  //ending entire Auction for a player
  socket.on('endEntireAuction',async(data:EndAuctionData) => {
   const {auctionId}= data;
   try {
    if(!auctionId) {
      socket.emit('errorMessage', ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
      return;
    }

    // Fetch the auction and its associated Players
    const auction = await db.Auction.findByPk(auctionId, {
      include: [
        {
          model: db.Player,
          as: 'player',
          attributes: ['id','name'],
        },
      ],
    });

    if(!auction) {
      socket.emit('errorMessage',ERROR_MESSAGES.AUCTION_NOT_FOUND);
      return;
    }


    //check if players are pending
  const pendingAuctions = await db.Auction.count({
    where: {
      playerId: auction.playerId,
      status: 'pending',
    }
  });
  console.log("pendingAuctions",pendingAuctions);

  if(pendingAuctions > 0) {
    socket.emit('errorMessage',ERROR_MESSAGES.PENDING_PLAYERS_LEFT);
      return;
  }

  auction.status = 'accepted';
  await auction.save();   
  
  //Emit success message
  const response = {
    message: SUCCESS_MESSAGES.AUCTION_END_SUCCESSFULLY,
    auction
  };
   socket.emit('auctionEnded',response);
   io.emit('auctionEnded',response);
    
   }catch(error) {
    console.error('Error ending entire auction:', error);
    socket.emit('errorMessage',ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
   }
  })
  
    socket.on('disconnect',() => {
    console.info('Client disconnected',socket.id);
    });
});


}