"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Homework extends Model {
    static associate(models) {
      Homework.belongsTo(models.Quest, { foreignKey: "questId" });
      Homework.hasMany(models.HomeworkMaterial, { foreignKey: "homeworkId", onDelete: 'CASCADE', hooks: true });
      Homework.hasMany(models.HomeworkSubmission, { foreignKey: "homeworkId", onDelete: 'CASCADE', hooks: true });
    }
  }

  Homework.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      questId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Homework",
    }
  );
  return Homework;
};