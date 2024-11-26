import * as dotenv from 'dotenv'
dotenv.config();
import { DataTypes,Sequelize } from 'sequelize';

import config from './models/config';
import {user} from './models/user.model'
import { player } from './models/player.model';
import {team} from './models/team.model';
import {accessToken} from './models/access-token.model';
import {teamOwner} from './models/team-owner.model';
import{tournament} from './models/tournament.model';
import {auction} from './models/auction.model';
import {bid} from './models/bid.model';
import {teamTournament} from './models/team_tournament.model';
import {bidHistory}from './models/bid-history.model';
const env = process.env.NODE_ENV || 'development';

type Model = (typeof db)[keyof typeof db]

type ModelWithAssociate = Model & { associate:(model: typeof db) => void }

const checkAssociation = (model: Model): model is ModelWithAssociate => {
    return 'associate' in model;
};

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database,dbConfig.username, dbConfig.password,dbConfig);

const db = {
    sequelize: sequelize,
     User: user(sequelize,DataTypes),
     Player: player(sequelize,DataTypes),
     Team: team(sequelize,DataTypes),
     AccessToken: accessToken(sequelize,DataTypes),
     TeamOwner: teamOwner(sequelize,DataTypes),
     Tournament: tournament(sequelize,DataTypes),
     Auction: auction(sequelize,DataTypes),
     Bid: bid(sequelize,DataTypes),
     TeamTournament: teamTournament(sequelize,DataTypes),
     BidHistory: bidHistory(sequelize,DataTypes),
     models: sequelize.models
};

Object.entries(db).forEach(([, model]: [string,Model]) => {
   if(checkAssociation(model)) {
    model.associate(db);
   } 
});

export default db;