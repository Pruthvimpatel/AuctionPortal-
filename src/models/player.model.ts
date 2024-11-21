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
    role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
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
    declare role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
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
        role: {
          type: DataTypes.ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'),
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
      Player.hasMany(models.Tournament, { foreignKey: 'playerId' });  // One Player can have many Tournaments
    };
  
    return Player;
  };
  