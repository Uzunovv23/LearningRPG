const {
  Quest,
  Quiz,
  Question,
  Answer,
  Hero,
  HeroQuest,
  Score,
  HeroBalance,
} = require("../models");

exports.index = async (req, res) => {
  try {
    const quests = await Quest.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });

    res.render("quests/index", {
      title: "Available Quests",
      quests: quests,
    });
  } catch (error) {
    console.error("Error in index:", error);
    res.status(500).send("Error loading quests.");
  }
};

exports.show = async (req, res) => {
  try {
    const quest = await Quest.findByPk(req.params.id, {
      include: [
        {
          model: Quiz,
          attributes: ["id", "title"],
        },
      ],
    });

    if (!quest) {
      return res.status(404).render("error", { message: "Quest not found." });
    }

    const currentUser = req.user || req.session.user;

    if (currentUser) {
      const hero = await Hero.findOne({
        where: { userId: currentUser.id },
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
    res.status(500).send("Error loading quest.");
  }
};

exports.showQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;

    const quiz = await Quiz.findOne({
      where: { id: quizId, questId: id },
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
    });

    if (!quiz) {
      return res.status(404).send("Quiz not found.");
    }

    res.render("quests/quiz", {
      title: quiz.title,
      questId: id,
      quiz: quiz,
    });
  } catch (error) {
    console.error("Error in showQuiz:", error);
    res.status(500).send("Error loading quiz.");
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const userId = req.user ? req.user.id : req.session.user.id;
    const userAnswers = req.body;

    const quiz = await Quiz.findOne({
      where: { id: quizId, questId: id },
      include: [{ model: Question, include: [Answer] }],
    });

    if (!quiz) {
      return res.status(404).send("Quiz not found.");
    }

    let totalPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;

    quiz.Questions.forEach((question) => {
      const qPoints = Number(question.points) || 10;
      maxPoints += qPoints;

      const submittedAnswerId = userAnswers[`answers[${question.id}]`];

      if (submittedAnswerId) {
        const pickedAnswer = question.Answers.find(
          (a) => a.id === Number(submittedAnswerId),
        );
        if (pickedAnswer?.isCorrect) {
          totalPoints += qPoints;
          correctCount++;
        }
      }
    });

    const scorePercentage = maxPoints > 0 ? totalPoints / maxPoints : 0;

    const PASS_THRESHOLD = 0.3;

    const isCurrentAttemptSuccess = scorePercentage >= PASS_THRESHOLD;

    const alreadyPassed = await Score.findOne({
      where: {
        userId: userId,
        quizId: quizId,
        isPassed: true,
      },
    });

    let xpAwarded = 0;
    let coinsAwarded = 0;
    let message = "";

    if (isCurrentAttemptSuccess) {
      if (!alreadyPassed) {
        const hero = await Hero.findOne({ where: { userId: userId } });

        if (hero) {
          const rewardXP = quiz.xpReward || 50;
          hero.xp += rewardXP;
          await hero.save();

          const rewardCoins = totalPoints;

          const [balance] = await HeroBalance.findOrCreate({
            where: {
              heroId: hero.id,
              questId: id,
            },
            defaults: { amount: 0 },
          });

          balance.amount += rewardCoins;
          await balance.save();

          xpAwarded = rewardXP;
          coinsAwarded = rewardCoins;

          message = `Поздравления! Мисията изпълнена (над 30%): +${rewardXP} XP и +${rewardCoins} KC!`;
        }
      } else {
        message =
          "Тестът е преминат успешно! (XP и KC вече са получени при предишен опит)";
      }
    } else {
      message =
        "Слаб резултат. Трябват ти поне 30% верни отговори (за Среден 3), за да получиш награда. Опитай пак!";
    }

    await Score.create({
      points: totalPoints,
      userId: userId,
      questId: id,
      quizId: quizId,
      isPassed: isCurrentAttemptSuccess,
    });

    res.render("quests/result", {
      title: "Quiz Result",
      questTitle: quiz.title,
      questId: id,
      points: totalPoints,
      maxPoints: maxPoints,
      correctCount: correctCount,
      xpEarned: xpAwarded,
      coinsEarned: coinsAwarded,
      message: message,
      isSuccess: isCurrentAttemptSuccess,
    });
  } catch (error) {
    console.error("Error in submitQuiz:", error);
    res.status(500).send("Error processing results.");
  }
};
