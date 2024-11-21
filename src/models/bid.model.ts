import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface BidModelCreationAttributes {
    auctionId: string;
    teamId: string;
    role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
    bidAmount: string;
    startTime: string;
    endTime: string;
  }
  
  export interface BidModelAttributes extends BidModelCreationAttributes {
    id: string;
  }
  
  export default class Bid extends Model<InferAttributes<Bid>, InferCreationAttributes<Bid>> {
    declare id: CreationOptional<string>;
    declare auctionId: string;
    declare teamId: string;
    declare status: 'pending' | 'accepted' | 'rejected';
    declare bidAmount: string;
    declare startTime: string;
    declare endTime: string;
  
    static associate: (models: typeof db) => void;
  }
  

  export const bid = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    Bid.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        auctionId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
          },
        status: {
          type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
          allowNull: false,
        },
        bidAmount: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
        }
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Bid',
        tableName: 'bids',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Bid.associate = models => {
    Bid.belongsTo(models.Auction, { foreignKey: 'auctionId' });
    Bid.belongsTo(models.Team, { foreignKey: 'teamId' });
    }
  
    return Bid;
  };
  