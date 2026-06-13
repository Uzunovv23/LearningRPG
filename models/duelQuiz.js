"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DuelQuiz extends Model {
    static associate(models) {
      DuelQuiz.belongsTo(models.Duel, { foreignKey: "duelId", onDelete: "CASCADE" });
      DuelQuiz.belongsTo(models.Quiz, { foreignKey: "quizId", onDelete: "CASCADE" });
    }
  }

  DuelQuiz.init(
    {
      duelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DuelQuiz",
      timestamps: false,
    },
  );
  return DuelQuiz;
};
