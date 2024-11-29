import Joi from "joi";

export const placeBidSchema = Joi.object({
    auctionId: Joi.string().uuid().required(),
    teamId: Joi.string().uuid().required(),
    playerId: Joi.string().uuid().required(),
    bidAmount: Joi.number().positive().required(),
    startTime: Joi.string().isoDate().required(),
    endTime: Joi.string().isoDate().required(),
  });

export const updateBidStatusSchema = Joi.object({
    bidId: Joi.string().uuid().required(),
    status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
});
