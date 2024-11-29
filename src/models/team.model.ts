import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface TeamModelCreationAttributes {
    name: string;
    userId: string;
    logo: string;
  }
  
  export interface TeamModelAttributes extends TeamModelCreationAttributes {
    id: string;
  }
  
  export default class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare userId: string;
    declare logo: string;
  
    static associate: (models: typeof db) => void;
  }
  
  export const team = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    Team.init(
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
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        logo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Team',
        tableName: 'teams',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Team.associate = models => {
      Team.hasMany(models.Player, { foreignKey: 'teamId' });
      Team.hasMany(models.Tournament, { foreignKey: 'teamId' });
      Team.hasMany(models.Bid, { foreignKey: 'teamId' });
      Team.hasMany(models.BidHistory, { foreignKey: 'teamId',constraints: false });
      Team.belongsTo(models.User, { foreignKey: 'userId'}); 
      Team.belongsToMany(models.Tournament, {
        through: models.TeamTournament,
        foreignKey: 'teamId',
        otherKey: 'tournamentId',
      });
    };
  
    return Team;
  };
  