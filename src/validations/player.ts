import Joi from "joi";
 
const roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
const Gender = ['Male', 'Female', 'Other'];
const battingOrder = ['Top','Middle','Lower'];
const battingHand = ['Left','Right'];
const bowlingHand = ['Left','Right'];
const skillRating = ['0' , '1' , '2' , '3' , '4' , '5'];
export const playerRegistrationSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.string().required(),
    role: Joi.string().valid(...roles).required(),
    teamId: Joi.string().uuid().required(),
    basePrice: Joi.string().required(),
    gender: Joi.string().valid(...Gender).required(),
    battingOrder: Joi.string().valid(...battingOrder).required(),
    battingHand: Joi.string().valid(...battingHand).required(),
    bowlingHand: Joi.string().valid(...bowlingHand).required(),
    skillRating: Joi.string().valid(...skillRating).required(),
  });

  export const updatePlayerDetailsSchema = Joi.object({
    playerId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    age: Joi.string().required(),
    role: Joi.string().valid(...roles).required(),
    basePrice: Joi.string().required(),
    gender: Joi.string().valid(...Gender).required(),
    battingOrder: Joi.string().valid(...battingOrder).required(),
    battingHand: Joi.string().valid(...battingHand).required(),
    bowlingHand: Joi.string().valid(...bowlingHand).required(),
    skillRating: Joi.string().valid(...skillRating).required(),
  });

  export const deletePlayerSchema = Joi.object({
    playerId: Joi.string().uuid().required(),
  });
  