"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.User, { foreignKey: "userId" });
      Inventory.belongsTo(models.DroppedItem, { foreignKey: "itemId" });
    }
  }

  Inventory.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Inventory",
      tableName: "Inventories",
    },
  );
  return Inventory;
};
