"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Hero, { foreignKey: "userId", onDelete: "CASCADE" });
      User.hasMany(models.Score, { foreignKey: "userId", onDelete: "CASCADE" });
      User.hasMany(models.Purchase, { foreignKey: "userId", onDelete: "CASCADE" });
      User.hasMany(models.HomeworkSubmission, { foreignKey: "userId", onDelete: "CASCADE" });
      User.hasMany(models.Inventory, { foreignKey: "userId", onDelete: "CASCADE" });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
      indexes: [
        {
          unique: true,
          fields: ['username']
        },
        {
          unique: true,
          fields: ['email']
        }
      ]
    }
  );
  return User;
};