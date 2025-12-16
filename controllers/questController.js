const {
  Quest,
  Quiz,
  Question,
  Answer,
  Hero,
  HeroQuest,
  Score,
} = require("../models");

exports.index = async (req, res) => {
  try {
    const quests = await Quest.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });

    res.render("quests/index", {
      title: "Налични Мисии",
      quests: quests,
    });
  } catch (error) {
    console.error("Error in index:", error);
    res.status(500).send("Грешка при зареждане на куестовете.");
  }
};

exports.show = async (req, res) => {
  try {
    const quest = await Quest.findByPk(req.params.id, {
      include: [
        {
          model: Quiz,
          include: [
            {
              model: Question,
              include: [
                {
                  model: Answer,

                  attributes: ["id", "text"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!quest) {
      return res
        .status(404)
        .render("error", { message: "Куестът не е намерен." });
    }

    if (req.session.user) {
      const hero = await Hero.findOne({
        where: { userId: req.session.user.id },
      });
      if (hero) {
        await HeroQuest.findOrCreate({
          where: { heroId: hero.id, questId: quest.id },
          defaults: { status: "started" },
        });
      }
    }

    res.render("quests/show", {
      title: quest.title,
      quest: quest,
    });
  } catch (error) {
    console.error("Error in show:", error);
    res.status(500).send("Грешка при зареждане на куеста.");
  }
};

exports.submit = async (req, res) => {
  try {
    const questId = req.params.id;
    const userId = req.user.id;
    const userAnswers = req.body;

    const quest = await Quest.findByPk(questId, {
      include: [
        {
          model: Quiz,
          include: [
            {
              model: Question,
              include: [Answer],
            },
          ],
        },
      ],
    });

    if (!quest) {
      return res.status(404).send("Куестът не е намерен.");
    }

    let totalPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;

    quest.Quizzes.forEach((quiz) => {
      quiz.Questions.forEach((question) => {
        const qPoints = question.points || 10;
        maxPoints += qPoints;

        const submittedAnswerId = userAnswers[`question_${question.id}`];

        if (submittedAnswerId) {
          const pickedAnswer = question.Answers.find(
            (a) => a.id == Number(submittedAnswerId)
          );
          if (pickedAnswer && pickedAnswer.isCorrect) {
            totalPoints += qPoints;
            correctCount++;
          }
        }
      });
    });

    await Score.create({
      points: totalPoints,
      userId: userId,
      questId: questId,
    });

    let xpAwarded = 0;

    const hero = await Hero.findOne({ where: { userId: userId } });

    if (hero) {
      if (totalPoints > 0) {
        hero.xp += quest.xpReward;
        await hero.save();
        xpAwarded = quest.xpReward;
      }

      const [hq, created] = await HeroQuest.findOrCreate({
        where: { heroId: hero.id, questId: questId },
        defaults: { status: "completed" },
      });

      if (!created) {
        hq.status = "completed";
        await hq.save();
      }
    }

    res.render("quests/result", {
      title: "Резултат от куеста",
      questTitle: quest.title,
      points: totalPoints,
      maxPoints: maxPoints,
      correctCount: correctCount,
      xpEarned: xpAwarded,
    });
  } catch (error) {
    console.error("Error in submit:", error);
    res.status(500).send("Грешка при обработка на резултатите.");
  }
};
