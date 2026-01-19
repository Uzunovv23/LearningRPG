"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.User, { foreignKey: "userId" });
      Purchase.belongsTo(models.ShopItem, { foreignKey: "shopItemId" });
    }
  }

  Purchase.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shopItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Purchase",
    },
  );
  return Purchase;
};
