import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface TeamTournamentModelCreationAttributes {
    teamId: string;
    tournamentId: string;
  }
  
  export interface TeamTournamentModelAttributes extends TeamTournamentModelCreationAttributes {
    id: string;
  }
  
  export default class TeamTournament extends Model<InferAttributes<TeamTournament>, InferCreationAttributes<TeamTournament>> {
    declare id: CreationOptional<string>;
    declare teamId: string;
    declare tournamentId: string;
  
    static associate: (models: typeof db) => void;
  }
  

  export const teamTournament = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    TeamTournament.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        teamId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        tournamentId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'TeamTournament',
        tableName: 'team_tournaments',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TeamTournament.associate = models => {
    TeamTournament.belongsTo(models.Team, { foreignKey: 'teamId' });
    TeamTournament.belongsTo(models.Tournament, { foreignKey: 'tournamentId' });
    };
  
    return TeamTournament;
  };
  