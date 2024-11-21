import Joi from "joi";

export const registerOwnerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const updateOwnerSchema = Joi.object({
    ownerId: Joi.string().uuid().required(),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
});

export const assignTeamSchema = Joi.object({
    ownerId: Joi.string().uuid().required(),
    teamId: Joi.string().uuid().required(),
});

export const updatePointsSchema = Joi.object({
    ownerId: Joi.string().uuid().required(),
    points: Joi.number().min(0).required(),
  });