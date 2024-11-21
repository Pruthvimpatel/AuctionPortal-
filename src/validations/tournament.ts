import Joi from "joi";

export const createTournamentSchema = Joi.object({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    location: Joi.string().required(),
  });


export const updateTournamentSchema = Joi.object({
    tournamentId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    location: Joi.string().required(),
  });
  