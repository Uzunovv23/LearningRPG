"use strict";
const { Quest, Score, User, Hero } = require("../models");

exports.getIndex = async (req, res) => {
  try {
    const currentUser = req.user || (req.session && req.session.user);

    const rankingType = req.query.type === "quest" ? "quest" : "level";

    let quests = [];
    let selectedQuestId = req.query.questId;
    let selectedQuest = null;
    let leaderboard = [];

    if (rankingType === "level") {
      const topHeroes = await Hero.findAll({
        include: [
          {
            model: User,
            attributes: ["username"], 
          },
        ],
        order: [
          ["level", "DESC"],
          ["xp", "DESC"], 
        ],
        limit: 10,
      });

      leaderboard = topHeroes.map((hero) => {
       
        const xpPerLevel = 1000; 
        const calculatedLevel = Math.floor((hero.xp || 0) / xpPerLevel) + 1;

        return {
          user: hero.User,
          xp: hero.xp || 0,
          level: calculatedLevel, 
        };
      });
    }

    else if (rankingType === "quest") {
      quests = await Quest.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });

      if (quests.length > 0) {
        if (!selectedQuestId) {
          selectedQuestId = quests[0].id; 
        }
        selectedQuest = quests.find((q) => q.id == selectedQuestId);

        if (selectedQuest) {
          const allScores = await Score.findAll({
            where: {
              questId: selectedQuestId,
              isPassed: true,
            },
            order: [["createdAt", "ASC"]],
            include: [
              {
                model: User,
                attributes: ["id", "username"],
                include: [{ model: Hero }],
              },
            ],
          });

          const userPointsMap = {};
          const passedQuizzesTracker = new Set(); 

          allScores.forEach((score) => {
            const userQuizKey = `${score.userId}-${score.quizId}`;

            if (!passedQuizzesTracker.has(userQuizKey)) {
              passedQuizzesTracker.add(userQuizKey);

              if (!userPointsMap[score.userId]) {
                userPointsMap[score.userId] = {
                  user: score.User,
                  totalPoints: 0,
                };
              }
              userPointsMap[score.userId].totalPoints +=
                Number(score.points) || 0;
            }
          });

          leaderboard = Object.values(userPointsMap)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 10);
        }
      }
    }

    res.render("leaderboard/index", {
      title: "Глобална Класация",
      rankingType: rankingType, 
      quests: quests,
      selectedQuest: selectedQuest,
      leaderboard: leaderboard,
      user: currentUser,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).send("Грешка при зареждане на класацията.");
  }
};
