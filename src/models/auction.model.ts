import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
  import db from '../sequelize-client';
  
  export interface AuctionModelCreationAttributes {
    tournamentId: string;
    playerId:string;
    startTime: string;
    endTime: string;
    bidAmount: string;
    status: 'pending' | 'accepted' | 'rejected';

  }
  
  export interface AuctionModelAttributes extends AuctionModelCreationAttributes {
    id: string;
  }
  
  export default class Auction extends Model<InferAttributes<Auction>, InferCreationAttributes<Auction>> {
    declare id: CreationOptional<string>;
    declare tournamentId: string;
    declare playerId: string;
    declare startTime: string;
    declare endTime: string;
    declare bidAmount: string;
    declare status: 'pending' | 'accepted' | 'rejected';
  
    static associate: (models: typeof db) => void;
  }
  
  export const auction = (
    sequelize: Sequelize.Sequelize,
    DataTypes: typeof Sequelize.DataTypes,
  ) => {
    Auction.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        tournamentId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        playerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        bidAmount: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            allowNull: false,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false, 
            },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'Auction',
        tableName: 'auctions',
      }
    );
  
    Auction.associate = models => {
        Auction.belongsTo(models.Tournament, { foreignKey: 'tournamentId' });
        Auction.hasMany(models.Bid, { foreignKey: 'auctionId' });
        Auction.belongsTo(models.Player, { foreignKey: 'playerId' ,as: 'player'});
    };
  
    return Auction;
  };
  