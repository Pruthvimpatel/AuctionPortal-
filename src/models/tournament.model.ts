import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface TournamentModelCreationAttributes {
    name: string;
    playerId: string;
    teamId: string;
    startDate: string;
    endDate: string;
    location: string;
  }
  
  export interface TournamentModelAttributes extends TournamentModelCreationAttributes {
    id: string;
  }
  
  export default class Tournament extends Model<InferAttributes<Tournament>, InferCreationAttributes<Tournament>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare playerId: string;
    declare teamId: string;
    declare startDate: string;
    declare endDate: string;
    declare location: string;
  
    static associate: (models: typeof db) => void;
  }
  
  export const tournament = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    Tournament.init(
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
        playerId: {
         type: DataTypes.UUID,
         allowNull: false,
        },
        teamId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        startDate: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        endDate: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Tournament',
        tableName: 'tournaments',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
   Tournament.associate = models => {
    Tournament.hasMany(models.Auction, { foreignKey: 'tournamentId'});
    Tournament.belongsTo(models.Team, { foreignKey: 'teamId'});
    Tournament.belongsTo(models.Player, { foreignKey: 'playerId'});
    Tournament.belongsToMany(models.Team, {
      through: models.TeamTournament,
      foreignKey: 'tournamentId',
      otherKey: 'teamId',
    });
   };
  
    return Tournament;
  };
  