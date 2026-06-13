"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Duel extends Model {
    static associate(models) {
      Duel.belongsTo(models.Hero, { as: "Initiator", foreignKey: "initiatorId" });
      Duel.belongsTo(models.Hero, { as: "Opponent", foreignKey: "opponentId" });     
      Duel.belongsTo(models.Inventory, { as: "InitiatorWager", foreignKey: "initiatorWagerId" });
      Duel.belongsTo(models.Inventory, { as: "OpponentWager", foreignKey: "opponentWagerId" });
      Duel.belongsTo(models.Hero, { as: "Winner", foreignKey: "winnerId" });
      Duel.belongsToMany(models.Quiz, { through: models.DuelQuiz, foreignKey: "duelId", onDelete: "CASCADE" });
    }
  }

  Duel.init(
    {
      status: {
        type: DataTypes.ENUM("pending", "active", "finished", "declined"),
        defaultValue: "pending",
        allowNull: false,
      },
      initiatorScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      opponentScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      initiatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      opponentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      initiatorWagerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      opponentWagerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      winnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      questionIds: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      initiatorFinished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      opponentFinished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "Duel",
    }
  );
  return Duel;
};