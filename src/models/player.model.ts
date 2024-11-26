import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface PlayerModelCreationAttributes {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    profilePicture?: string | null;
    role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
    battingOrder: 'Top' | 'Middle' | 'Lower';
    battingHand: 'Left' | 'Right';
    bowlingHand: 'Left' | 'Right';
    skillRating: '0' | '1' | '2' | '3' | '4' | '5';
    teamId: string;
    basePrice: string;
  }
  
  export interface PlayerModelAttributes extends PlayerModelCreationAttributes {
    id: string;
  }
  
  export default class Player extends Model<InferAttributes<Player>, InferCreationAttributes<Player>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare age: string;
    declare gender: 'Male' | 'Female' | 'Other';
    declare profilePicture: CreationOptional<string | null>
    declare role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
    declare battingOrder: 'Top' | 'Middle' | 'Lower';
    declare battingHand: 'Left' | 'Right';
    declare bowlingHand: 'Left' | 'Right';
    declare skillRating: '0' | '1' | '2' | '3' | '4' | '5';
    declare teamId: string;
    declare basePrice: string;
  
    static associate: (models: typeof db) => void;
  }
  

  export const player = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    Player.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        age: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        gender: {
          type: DataTypes.ENUM('Male', 'Female', 'Other'),
          allowNull: false,
        },
        profilePicture: {
          type: DataTypes.STRING,
          allowNull: true,
      },
        role: {
          type: DataTypes.ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'),
          allowNull: false,
        },
        battingOrder: {
          type: DataTypes.ENUM('Top', 'Middle', 'Lower'),
          allowNull: false,
        },
        battingHand: {
          type: DataTypes.ENUM('Left', 'Right'),
          allowNull: false,
        },
        bowlingHand: {
          type: DataTypes.ENUM('Left', 'Right'),
          allowNull: false,
        },
        skillRating: {
          type:DataTypes.ENUM('0' , '1' , '2' , '3' , '4' , '5'),
          allowNull: false,
        },
        teamId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        basePrice: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Player',
        tableName: 'players',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Player.associate = models => {
      Player.belongsTo(models.Team, { foreignKey: 'teamId' });
      Player.hasMany(models.Auction, { foreignKey: 'playerId' });
      Player.hasMany(models.Tournament, { foreignKey: 'playerId' });
      Player.hasMany(models.BidHistory, {foreignKey: 'playerId' });
    };
  
    return Player;
  };
  