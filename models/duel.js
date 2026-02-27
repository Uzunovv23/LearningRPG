"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Duel extends Model {
    static associate(models) {
      Duel.belongsTo(models.Hero, { as: 'Initiator', foreignKey: 'initiatorId' });
      Duel.belongsTo(models.Hero, { as: 'Opponent', foreignKey: 'opponentId' });
      
      Duel.belongsTo(models.Inventory, { as: 'InitiatorWager', foreignKey: 'initiatorWagerId' });
      Duel.belongsTo(models.Inventory, { as: 'OpponentWager', foreignKey: 'opponentWagerId' });

      Duel.belongsTo(models.Hero, { as: 'Winner', foreignKey: 'winnerId' });

      Duel.belongsToMany(models.Quiz, { through: models.DuelQuiz, foreignKey: 'duelId' });
    }
  }

  Duel.init(
    {
      status: {
        type: DataTypes.ENUM('pending', 'active', 'finished', 'declined'),
        defaultValue: 'pending',
        allowNull: false
      },
      initiatorScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      opponentScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      initiatorId: DataTypes.INTEGER,
      opponentId: DataTypes.INTEGER,
      initiatorWagerId: DataTypes.INTEGER,
      opponentWagerId: DataTypes.INTEGER,
      winnerId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Duel",
    }
  );
  return Duel;
};