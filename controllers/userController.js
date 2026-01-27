const {
  Hero,
  User,
  HeroQuest,
  Quest,
  Score,
  Purchase,
  ShopItem,
  Quiz,
  Homework,
  HomeworkMaterial
} = require("../models");

exports.show = async (req, res) => {
  try {
    const userId = req.user
      ? req.user.id
      : req.session.user
        ? req.session.user.id
        : null;

    if (!userId) {
      return res.redirect("/login");
    }

    const hero = await Hero.findOne({
      where: { userId: userId },
      include: [User],
    });

    if (!hero) {
      return res.redirect("/");
    }

    const heroQuests = await HeroQuest.findAll({
      where: { heroId: hero.id },
      include: [Quest],
    });

    const scores = await Score.findAll({
      where: { userId: userId, isPassed: true },
      include: [Quiz],
    });

    const purchases = await Purchase.findAll({
      where: { userId: userId },
      include: [
        {
          model: ShopItem,
          where: { isActive: true },
        },
      ],
    });

    const journal = heroQuests
      .filter((hq) => hq.Quest)
      .map((hq) => {
        const questId = hq.questId;

        const questScores = scores.filter((s) => s.questId === questId);

        const totalPoints = questScores.reduce((sum, s) => sum + s.points, 0);

        const totalXP = questScores.reduce((sum, s) => {
          const reward = s.Quiz && s.Quiz.xpReward ? s.Quiz.xpReward : 50;
          return sum + reward;
        }, 0);

        const questGrades = purchases
          .filter((p) => p.ShopItem && p.ShopItem.questId === questId)
          .map((p) => p.ShopItem);

        return {
          questTitle: hq.Quest.title,
          status: hq.status,
          points: totalPoints,
          xp: totalXP,
          grades: questGrades,
        };
      });

    res.render("users/my_hero", {
      title: "Моят Герой",
      hero: hero,
      journal: journal,
    });
  } catch (error) {
    console.error("Hero Controller Error:", error);
    res.status(500).render("error", {
      message: "Грешка при зареждане на профила.",
      error: error,
    });
  }
};

exports.getHomework = async (req, res) => {
  try {
    const homeworkId = req.params.id;

    const homework = await Homework.findByPk(homeworkId, {
      include: [
        { model: Quest, attributes: ["title"] },
        { model: HomeworkMaterial },
      ],
    });

    if (!homework) {
      return res.render("error", { message: "Домашното не е намерено." });
    }

    res.render("users/homework/show", {
      title: homework.title,
      homework: homework,
    });
  } catch (error) {
    console.error("Get Homework Error:", error);
    res.render("error", { message: "Грешка при зареждане на домашното." });
  }
};
