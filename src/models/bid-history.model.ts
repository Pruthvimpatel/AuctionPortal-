import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface BidHistoryModelCreationAttributes {
    auctionId: string;
    teamId: string;
    playerId: string;
    bidAmount: string;
  }
  
  export interface BidHistoryModelAttributes extends BidHistoryModelCreationAttributes {
    id: string;
  }
  
  export default class BidHistory extends Model<InferAttributes<BidHistory>, InferCreationAttributes<BidHistory>> {
    declare id: CreationOptional<string>;
    declare auctionId: string;
    declare teamId: string;
   declare playerId: string;
    declare bidAmount: string;

  
    static associate: (models: typeof db) => void;
  }
  

  export const bidHistory = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    BidHistory.init(
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
            allowNull: true,
          },
          playerId: {
            type: DataTypes.UUID,
            allowNull: false,
          },
        bidAmount: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'BidHistory',
        tableName: 'bid_history',
      }
    );
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BidHistory.associate = models => {
    BidHistory.belongsTo(models.Auction, { foreignKey: 'auctionId' });
    BidHistory.belongsTo(models.Team, { foreignKey: 'teamId',constraints: false });
    BidHistory.belongsTo(models.Player, { foreignKey: 'playerId' });
    }
  
return BidHistory;
  };
  