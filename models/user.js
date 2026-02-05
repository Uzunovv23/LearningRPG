"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Hero, { foreignKey: "userId" });
      User.hasMany(models.Score, { foreignKey: "userId" });
      User.hasMany(models.Purchase, { foreignKey: "userId" });
      User.hasMany(models.HomeworkSubmission, { foreignKey: "userId" });
      User.hasMany(models.Inventory, { foreignKey: "userId" });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    },
  );
  return User;
};
