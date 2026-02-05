"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DroppedItem extends Model {
    static associate(models) {
      DroppedItem.hasMany(models.Inventory, { foreignKey: "itemId" });
    }
  }

  DroppedItem.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        defaultValue: "fa-box-open",
      },
      type: {
        type: DataTypes.ENUM("quiz_help", "booster", "time_bender"),
        allowNull: false,
      },
      rarity: {
        type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
        defaultValue: "common",
      },
      effectValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment:
          "Числова стойност на ефекта (напр. 24 часа, 50 процента и т.н.)",
      },
    },
    {
      sequelize,
      modelName: "DroppedItem",
    },
  );

  return DroppedItem;
};
