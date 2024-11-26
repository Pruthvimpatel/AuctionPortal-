import { Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import {generateAccessToken,generateRefreshToken} from '../utils/jwt.token'
import encryption from '../utils/encryption';
import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import { Op } from 'sequelize';
interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };


//Create a new tournament.
export const createTournament = asyncHandler(async(req:MyUserRequest,res: Response,next:NextFunction)=>{
    const user = req.user;
    const {name,startDate,endDate,location,playerId,teamId } = req.body;
    
    if(!user){
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }

    if(!name ||!startDate || !endDate ||!location ||!playerId ||!teamId) {
        return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED))
    }
    try{

        const start = new Date(startDate);
        const end = new Date(endDate);
        const overlappingTournament = await db.Tournament.findOne({
            where: {
                [Op.and]: [
                    { startDate: { [Op.lt]: end } },
                    { endDate: { [Op.gt]: start } }
                ]
            }
        });
        if(overlappingTournament) {
            return next(new ApiError(400,ERROR_MESSAGES.TOURNAMENT_OVERLAPPED));
        }
        const newTournament = await db.Tournament.create({name,startDate,endDate,location,playerId,teamId});
        const response = new ApiResponse(201,newTournament,SUCCESS_MESSAGES.TOURNAMENT_CREATED_SUCCESSFULLY);
        res.status(201).json(response);

    }catch(error){
        console.log(error);
        return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }

});

//get-list all the tournament
export const getAllTournament = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
 const user = req.user;
 if(!user) {
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
 }
 const page = parseInt(req.query.page as string) || 1;
 const limit = parseInt(req.query.limit as string) || 10;
 const offset = (page - 1) * limit;
 const { sortBy = 'name', sortOrder = 'ASC', search = '' } = req.query;

 const searchFilter = search ? {
    [Op.or]: [
      { name: { [Op.like]: `%${search}%` } },
      { location: { [Op.like]: `%${search}%` } },
    ]
  } : {};

  const validSortColumns = ['name', 'location', 'date'];
  const validSortOrders = ['ASC', 'DESC'];

  const orderBy = validSortColumns.includes(sortBy as string) ? (sortBy as string) : 'name';
  const order = validSortOrders.includes(sortOrder as string) ? (sortOrder as string) : 'ASC';
 try {
    const { rows: tournament, count: totalTournaments } = await db.Tournament.findAndCountAll({
        where: searchFilter,
        limit,
        offset,
        order: [[orderBy, order]],
      });
  
      const totalPages = Math.ceil(totalTournaments / limit); 
    if(!tournament){
     return next(new ApiError(401,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
    }

    const response = new ApiResponse(200, {
      tournament,
      pagination: {
        totalTournaments,
        totalPages,
        currentPage: page,
        pageSize: limit,
      }
    }, SUCCESS_MESSAGES.TOURNAMENT_FETCHED_SUCCESSFULLY);
    res.status(201).json(response);
 }catch(error) {
    console.log(error);
    return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
 }
});

//Fetch details of a specific tournament
export const getTournamentDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
const user = req.user;
const {tournamentId}= req.params;
if(!user) {
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
}
if(!tournamentId) {
    return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED))
}
try{

    const tournament = await db.Tournament.findOne({
        where: {
            id:tournamentId
        }
    });
    if(!tournament) {
        return next(new ApiError(401,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
    }

    const response = new ApiResponse(201,tournament,SUCCESS_MESSAGES.TOURNAMENT_DETAILS_FETCHED_SUCCESSFULLY);
    res.status(201).json(response);
}catch(error){
    console.log(error);
    return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}

});

//Update tournament details
export const updateTournamentDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
  const user = req.user;
  const {tournamentId,name,startDate,endDate,location} = req.body;
  if(!user) {
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
  }
  if(!tournamentId ||!name ||!startDate ||!endDate ||!location) {
    return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
  }
  try {
  const updateTournamentDetails = await db.Tournament.findByPk(tournamentId);
  if(!updateTournamentDetails) {
    return next(new ApiError(401,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
  }
  updateTournamentDetails.name = name;
  updateTournamentDetails.startDate = startDate;
  updateTournamentDetails.endDate = endDate;
  updateTournamentDetails.location = location;
  await updateTournamentDetails.save();

  const response = new ApiResponse(201,updateTournamentDetails,SUCCESS_MESSAGES.TOURNAMENT_UPDATED_SUCCESSFULLY);
  res.status(201).json(response);
  }catch(error) {
    console.log(error);
    return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }
});

//Delete a tournament
export const deleteTournamentDetails = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
const user = req.user;
const{tournamentId} = req.params;

if(!user){
    return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
}

if(!tournamentId) {
    return next(new ApiError(401,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
}
try {
const deleteTournament = await db.Tournament.findByPk(tournamentId);

if(!deleteTournament) {
    return next(new ApiError(401,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
}
await deleteTournament.destroy();
const response = new ApiResponse(200,SUCCESS_MESSAGES.TOURNAMENT_DELETED_SUCCESSFULLY);
res.status(200).json(response)
}catch(error) {
    console.log(error);
    return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
}
});


// Adding multiple Teams to Tournament 
export const addTeamToTournament = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
        return next(new ApiError(401,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    const {tournamentId} = req.params;
    const {teamIds} = req.body;

    if (!tournamentId || !teamIds || !Array.isArray(teamIds)) {
        return next(new ApiError(400, ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
      }

    try {

        const tournament = await db.Tournament.findByPk(tournamentId);
        if(!tournament) {
            return next(new ApiError(401,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
        }

        //team exists or not
        const team = await db.Team.findAll({
            where: {
                id: teamIds
            }
        });
        if(!team) {
            return next(new ApiError(401,ERROR_MESSAGES.NO_TEAM_FOUND));
        }

        const teamTournamentEntries = teamIds.map(teamId => ({
            teamId,
            tournamentId,
          }));
          await db.TeamTournament.bulkCreate(teamTournamentEntries);
        const response = new ApiResponse(201,{tournament,team},SUCCESS_MESSAGES.TEAMS_ADDED_TO_TOURNAMENT);
        res.status(201).json(response);

    }catch(error) {
        console.log(error);
        return next(new ApiError(401,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
});

//Fetch all teams participating in a specific tournament.
export const getTeamsInTournament = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user){
        return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    const {tournamentId} = req.params;
    if(!tournamentId) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
        const teamsInTournament = await db.Team.findAll({
            include: {
              model: db.Tournament,
              where: { id: tournamentId },
              attributes: [],
            },
          });

        if(!teamsInTournament) {
            return next(new ApiError(400,ERROR_MESSAGES.NO_TEAMS_FOUND_IN_TOURNAMENT));
        }

        const response = new ApiResponse(200,teamsInTournament,SUCCESS_MESSAGES.TEAMS_FETCHED_SUCCESSFULLY);
        res.status(200).json(response);
    }catch(error) {
        console.log(error)
        return next(new ApiError(400,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }

});


//Get All Tournaments for a Team
export const getTournamentsForTeam = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
    const user = req.user;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    const {teamId} = req.params;
    if(!teamId) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
     const tournaments = await db.TeamTournament.findAll({
        where: {
            teamId
        },
        include: [
            {
                model: db.Tournament
            }
        ]

     });

     if(!tournaments) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
     }
   const response = new ApiResponse(200,tournaments,SUCCESS_MESSAGES.TOURNAMENT_FETCHED_SUCCESSFULLY);
   res.status(200).json(response);
    }catch(error) {
        console.log(error);
        return next(new ApiError(400,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
});

//Update an existing existing association, such as assigning a new team to a tournament.
export const updateTeamTournament = asyncHandler(async(req:MyUserRequest,res:Response,next: NextFunction)=> {
    const user = req.user;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
    }
    const{id} = req.params;   //id = teamTournamentId
    const {teamId, tournamentId} = req.params;
    // if(!teamId || !tournamentId) {
    //     return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    // }
   try {
    const findTeam = await db.TeamTournament.findByPk(id);
    if(!findTeam) {
        return next(new ApiError(400,ERROR_MESSAGES.NO_TOURNAMENT_FOUND));
    }

    await findTeam.update({
        teamId,
        tournamentId
    })
    const response = new ApiResponse(200,findTeam,SUCCESS_MESSAGES.TEAM_TOURNAMENT_UPDATED_SUCCESSFULLY);
    res.status(200).json(response);

   }catch(error) {
    console.log(error);
    return next(new ApiError(400,ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
   }
})