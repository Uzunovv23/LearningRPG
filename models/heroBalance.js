"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HeroBalance extends Model {
    static associate(models) {
      HeroBalance.belongsTo(models.Hero, { foreignKey: "heroId", onDelete: "CASCADE" });
      HeroBalance.belongsTo(models.Quest, { foreignKey: "questId", onDelete: "CASCADE" });
    }
  }

  HeroBalance.init(
    {
      heroId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      questId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HeroBalance",
    },
  );
  return HeroBalance;
};
