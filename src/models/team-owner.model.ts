import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface TeamOwnerModelCreationAttributes {
    name: string;
    email: string;
    password: string;
    points:number;
  }
  
  export interface TeamOwnerModelAttributes extends TeamOwnerModelCreationAttributes {
    id: string;
  }
  
  export default class TeamOwner extends Model<InferAttributes<TeamOwner>, InferCreationAttributes<TeamOwner>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare email: string;
    declare password: string;
    declare points: number;
  
    static associate: (models: typeof db) => void;
  }
  
  export const teamOwner = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes
  ) => {
    TeamOwner.init(
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
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        points: {
          type: DataTypes.NUMBER,
          allowNull: false,
        },
      },
      {
        sequelize: sequelize,  
        modelName: 'TeamOwner',  
        tableName: 'team_owners',  
        underscored: true,
        timestamps: true, 
        paranoid: true,
      }
    );
  
    TeamOwner.associate = (models) => {
      TeamOwner.hasOne(models.Team, { foreignKey: 'ownerId' });
    };
  
    return TeamOwner;
  };
  