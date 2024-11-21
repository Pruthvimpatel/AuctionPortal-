import Joi from "joi";

const roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
export const playerRegistrationSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.string().required(),
    role: Joi.string().valid(...roles).required(),
    teamId: Joi.string().uuid().required(),
    basePrice: Joi.string().required(),
  });

  export const updatePlayerDetailsSchema = Joi.object({
    playerId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    role: Joi.string().valid(...roles).required(),
    basePrice: Joi.string().required(),
  });

  export const deletePlayerSchema = Joi.object({
    playerId: Joi.string().uuid().required(),
  });
  