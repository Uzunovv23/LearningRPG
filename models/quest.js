"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quest extends Model {
    static associate(models) {
      Quest.hasMany(models.Task, {
        foreignKey: "questId",
        onDelete: "CASCADE",
      });

      Quest.hasMany(models.Score, { foreignKey: "questId" });
    }
  }

  Quest.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      xpReward: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Quest",
    }
  );
  return Quest;
};
