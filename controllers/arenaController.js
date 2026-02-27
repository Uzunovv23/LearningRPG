"use strict";
const {
  Hero,
  Score,
  Quiz,
  Quest,
  Inventory,
  DroppedItem,
} = require("../models");

exports.getLobby = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    if (!currentHero) {
      return res.redirect("/users/my-hero");
    }

    const passedScores = await Score.findAll({
      where: {
        userId: userId,
        isPassed: true,
      },
      include: [
        {
          model: Quiz,
          include: [{ model: Quest }],
        },
      ],
    });

    const uniqueQuizzesMap = new Map();
    passedScores.forEach((score) => {
      if (score.Quiz && !uniqueQuizzesMap.has(score.Quiz.id)) {
        uniqueQuizzesMap.set(score.Quiz.id, score.Quiz);
      }
    });
    const availableQuizzes = Array.from(uniqueQuizzesMap.values());

    const inventoryItems = await Inventory.findAll({
      where: {
        heroId: currentHero.id,
        isLocked: false,
      },
      include: [
        {
          model: DroppedItem,
          required: true,
        },
      ],
    });

    res.render("arena/lobby", {
      title: "⚔️ Арена - Лоби",
      hero: currentHero,
      quizzes: availableQuizzes,
      inventory: inventoryItems,
    });
  } catch (error) {
    console.error("Arena Lobby Error:", error);
    res.status(500).send("Грешка при зареждане на Арената.");
  }
};
