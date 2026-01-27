"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HomeworkMaterial extends Model {
    static associate(models) {
      HomeworkMaterial.belongsTo(models.Homework, { foreignKey: "homeworkId" });
    }
  }

  HomeworkMaterial.init(
    {
      fileName: {
        type: DataTypes.STRING,
        allowNull: false, 
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false, 
      },
      mimeType: {
        type: DataTypes.STRING, 
      },
      homeworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HomeworkMaterial",
    }
  );
  return HomeworkMaterial;
};