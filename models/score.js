"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Score extends Model {
    static associate(models) {
      Score.belongsTo(models.User, {foreignKey: "userId",onDelete: "CASCADE",});
      Score.belongsTo(models.Quest, {foreignKey: "questId",onDelete: "CASCADE",});
      Score.hasMany(models.HeroQuizTaken, { foreignKey: 'scoreId' });
    }
  }

  Score.init(
    {
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      questId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Score",
    }
  );
  return Score;
};