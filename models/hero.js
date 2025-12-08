"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hero extends Model {
    static associate(models) {
      Hero.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  Hero.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      health: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      mana: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Hero",
    }
  );
  return Hero;
};
