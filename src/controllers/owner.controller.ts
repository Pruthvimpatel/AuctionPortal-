import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';

import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { Op } from 'sequelize';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

 //Register Owner
 export const registerOwner = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
   const {name,email,password} = req.body;

   if(!name || !email ||!password) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
}

try {
    const existingOwner = await db.TeamOwner.findOne({
        where: {email}
    })
    if(existingOwner) {
        return next(new ApiError(400,ERROR_MESSAGES.EMAIL_ALREADY_EXISTS));
    }

    //validate unique team name
    const existingTeamName = await db.Team.findOne({
        where: {name}
    })
    if(existingTeamName) {
        return next(new ApiError(400,ERROR_MESSAGES.TEAM_NAME_ALREADY_EXISTS));
    }
    const newOwner = await db.TeamOwner.create({name,email,password,points: 1000000});
    const ownerResponse = {
        name: newOwner.name,
        email: newOwner.email
    }
    const response = new ApiResponse(201,ownerResponse,SUCCESS_MESSAGES.OWNER_REGISTRATION);
    res.status(200).send(response);}catch(error) {
    console.log(error)
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
 }) 

 //Get a list of all team owners.
 export const getAllOwners = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

  const { sortBy = 'name', sortOrder = 'ASC', search = '' } = req.query;

  const searchFilter = search ? {
    [Op.or]: [
      { name: { [Op.like]: `%${search}%` } },
    ]
  } : {};

  const validSortColumns = ['name', 'role', 'team']; 
  const validSortOrders = ['ASC', 'DESC'];
  const orderBy = validSortColumns.includes(sortBy as string) ? (sortBy as string) : 'name';
  const order = validSortOrders.includes(sortOrder as string) ? (sortOrder as string) : 'ASC';
    if(!user) {
     return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    try {

        const { rows: owner, count: totalOwners } = await db.TeamOwner.findAndCountAll({
            where: searchFilter,
            limit,
            offset,
            order: [[orderBy, order]],
          }); 
        if(!owner) {
            return next(new ApiError(404,ERROR_MESSAGES.NO_OWNERS_FOUND));
        }
        const totalPages = Math.ceil(totalOwners / limit);
        const response = new ApiResponse(200, {
            owner,
            pagination: {
              totalOwners,
              totalPages,
              currentPage: page,
              pageSize: limit,
            }
          }, SUCCESS_MESSAGES.OWNERS_FETCHED_SUCCESSFULLY);
        res.status(200).send(response);
    }catch(error) {
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
 })

 //Fetch details of a specific owner
 export const getOwnerDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
    const user = req.user;
    const {ownerId} = req.params;
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    try{
    const ownerDetails = await db.TeamOwner.findOne({
        where: {
            id:ownerId
        }
    })
    if(!ownerDetails){
        return next(new ApiError(401,ERROR_MESSAGES.NO_OWNERS_FOUND))
    }

    const response = new ApiResponse(200,ownerDetails,SUCCESS_MESSAGES.OWNER_DETAILS_FETCHED_SUCCESSFULLY);
    res.status(200).json(response);
}catch(error){
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
})

//Update owner details
export const updateOwnerDetails = asyncHandler(async(req:MyUserRequest,res: Response,next:NextFunction)=>{
    const user = req.user;
    const{ownerId,name,email,password} = req.body
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    if(!ownerId ||!name ||!email ||!password){
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try{
        const UpdateOwnerDetails = await db.TeamOwner.findByPk(ownerId);
        if(!UpdateOwnerDetails){
            return next(new ApiError(400,ERROR_MESSAGES.NO_OWNERS_FOUND));
        }

        UpdateOwnerDetails.name = name;
        UpdateOwnerDetails.email = email;
        UpdateOwnerDetails.password =  password;

        await UpdateOwnerDetails.save();
        const response = new ApiResponse(200,UpdateOwnerDetails,SUCCESS_MESSAGES.OWNER_DETAILS_UPDATED_SUCCESSFULLY);
        res.status(200).json(response);

    } catch(error){
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
})

//Delete an owner.
export const deleteOwner = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {ownerId} = req.params;
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    if(!ownerId){
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }

    try {
        const deleteOwner = await db.TeamOwner.findByPk(ownerId);
        if(!deleteOwner){
            return next(new ApiError(400,ERROR_MESSAGES.NO_OWNERS_FOUND));
        }
        await deleteOwner.destroy();
        const response = new ApiResponse(200,SUCCESS_MESSAGES.OWNER_DELETED_SUCCESSFULLY);
        res.status(200).json(response);
    } catch(error){
        console.log(error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
})
 
//Assign a Team to an Owner
export const assignTeam = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
   const{ownerId}=req.params;
   const{teamId}= req.body;
   
   if(!ownerId || !teamId) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
   }

   try{
    const owner=await db.TeamOwner.findByPk(ownerId);
    if(!owner){
        return next(new ApiError(400,ERROR_MESSAGES.NO_OWNERS_FOUND));
    }

    const team = await db.Team.findByPk(teamId);
    if(!team){
        return next(new ApiError(400,ERROR_MESSAGES.NO_TEAM_FOUND))
    }

    const existingAssignment = await db.Team.findOne({
        where:{
            id:teamId,
            userId:ownerId
        }
    });
    if(existingAssignment) {
        return next(new ApiError(400,ERROR_MESSAGES.ALREADY_ASSIGNED_TO_OWNER));
    }
    team.userId = ownerId;
    await team.save();
    const response = new ApiResponse(200,SUCCESS_MESSAGES.TEAM_ASSIGNED_SUCCESSFULLY);
    res.status(200).json(response);
   }catch(error){
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
})

//update Owner API
export const updateOwnerPoint = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
   const {ownerId,points} = req.body;
   
   if(!ownerId || !points) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
   }
   try {
    const owner = await db.TeamOwner.findByPk(ownerId);
    if(!owner) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_OWNERS_FOUND));
    }
    owner.points = points;
    await owner.save();
 
     const updatedOwnerResponse = {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        points: owner.points
     }

     const response = new ApiResponse(200, updatedOwnerResponse, SUCCESS_MESSAGES.OWNER_POINTS_UPDATED_SUCCESSFULLY);
     res.status(200).json(response);

   }catch(error) {
    console.log(error);
    return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
})