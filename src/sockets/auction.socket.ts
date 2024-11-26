import {Server, Socket} from 'socket.io';
import db from '../sequelize-client';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';


export default function AuctionSocket(io: Server) {
    io.on('connection',(socket: Socket) => {
        console.info('New client connected',socket.id);
        
    //Handling starting an auction
    socket.on('startAuction',async(data)=> {
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

         //create the auction in db
         const auction = await db.Auction.create({
            tournamentId,
            startTime,
            endTime,
            bidAmount,
            status: 'pending',
            playerId
          });

          // Emit a success response to the client
        socket.emit('auctionStarted', {
            message: SUCCESS_MESSAGES.AUCTION_START_SUCCESSFULLY,
            auction,
          });

           // Optionally, you can broadcast this information to other clients if needed
        io.emit('auctionUpdate', {
            auctionId: auction.id,
            tournamentId: auction.tournamentId,
            playerId: auction.playerId,
            bidAmount: auction.bidAmount,
            status: auction.status,
          });
  
        }catch(error) {
        console.error('Error starting auction:', error);
        socket.emit('errorMessage', ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        }
    });

    socket.on('disconnect',() => {
        console.info('Client disconnected',socket.id);
    });

});


}