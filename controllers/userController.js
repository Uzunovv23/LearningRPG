const { User, Hero, Score, Quest } = require("../models");

exports.getMyHero = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.Hero) {
      return res.render("error", {
        message: "Героят не е намерен! Моля, свържете се с администратор.",
      });
    }

    const hero = user.Hero;

    // --- НОВА ЛОГИКА ЗА НИВОТО ---
    // Формула: Ниво = (XP / 100) + 1 (закръглено надолу)
    // Примери: 50 XP -> Ниво 1; 120 XP -> Ниво 2; 220 XP -> Ниво 3
    const calculatedLevel = Math.floor(hero.xp / 100) + 1;

    // Ако записаното ниво е по-ниско от реалното, го обновяваме в базата
    if (hero.level < calculatedLevel) {
      hero.level = calculatedLevel;

      // Бонус: Може да вдигаме здравето/маната при левел ъп
      // hero.health += 10;

      await hero.save();
      console.log(`User ${user.username} leveled up to ${calculatedLevel}!`);
    }

    const nextLevelXpThreshold = calculatedLevel * 100;

    const xpToNextLevel = nextLevelXpThreshold - hero.xp;

    const currentLevelProgress = hero.xp % 100;

    const recentActivities = await Score.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: Quest, attributes: ["title"] }],
    });

    res.render("users/my_hero", {
      title: "Моят Герой",
      hero: hero,
      xpNeeded: nextLevelXpThreshold,
      currentLevelProgress: currentLevelProgress,
      xpToNextLevel: xpToNextLevel,
      activities: recentActivities,
    });
  } catch (error) {
    console.error("Hero Page Error:", error);
    res.status(500).send("Грешка при зареждане на героя");
  }
};
