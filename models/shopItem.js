"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ShopItem extends Model {
    static associate(models) {
      ShopItem.hasMany(models.Purchase, { foreignKey: "shopItemId", onDelete: 'CASCADE' });
      ShopItem.belongsTo(models.Quest, { foreignKey: "questId" });
  }
  }

  ShopItem.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      icon: {
        type: DataTypes.STRING,
        defaultValue: "fa-gift",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      questId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ShopItem",
    },
  );
  return ShopItem;
};
