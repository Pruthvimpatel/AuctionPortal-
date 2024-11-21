import Joi from "joi";

export const startAuctionSchema = Joi.object({
    tournamentId: Joi.string().uuid().required(),
    startTime: Joi.string().isoDate().required(),
    endTime: Joi.string().isoDate().required(),
    bidAmount: Joi.number().positive().required(),
    playerId: Joi.string().uuid().required(),
  });

  export const endAuctionSchema = Joi.object({
    auctionId: Joi.string().uuid().required(),
}); 
