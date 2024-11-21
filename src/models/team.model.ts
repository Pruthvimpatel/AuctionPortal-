import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface TeamModelCreationAttributes {
    name: string;
    ownerId: string;
    logo: string;
    budget: string;
  }
  
  export interface TeamModelAttributes extends TeamModelCreationAttributes {
    id: string;
  }
  
  export default class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare ownerId: string;
    declare logo: string;
    declare budget: string;
  
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
        ownerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        logo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        budget: {
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
    };
  
    return Team;
  };
  