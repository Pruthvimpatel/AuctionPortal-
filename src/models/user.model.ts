import bcrypt from 'bcrypt';
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface UserModelCreationAttributes {
  email: string;
  password: string;
  userName?: string;
  role?: 'admin' | 'teamOwner' | 'viewer';
  profilePicture?: string | null;
}

export interface UserModelAttributes extends UserModelCreationAttributes {
  id: string;
}

export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare userName: string;
  declare role: CreationOptional<'admin' | 'teamOwner' | 'viewer'>;
  declare profilePicture: CreationOptional<string | null>

  static associate: (models: typeof db) => void;

  static async hashPassword(user: User) {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
}

export const user = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes
) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Invalid email format',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 100],
            msg: 'Password must be at least 6 characters long',
          },
        },
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Username cannot be empty',
          },
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'teamOwner', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
    }
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: User.hashPassword,
        beforeUpdate: User.hashPassword,
      },
    }
  );

  User.associate = models => {
    User.hasMany(models.Team, { foreignKey: 'userId'});
    User.hasMany(models.Bid, { foreignKey: 'userId' });
  };

  return User;
};
