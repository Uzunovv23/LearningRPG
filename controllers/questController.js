const {
  Quest,
  Quiz,
  Question,
  Answer,
  Hero,
  HeroQuest,
  Score,
  HeroBalance,
  Homework,
  HomeworkMaterial,
  HomeworkSubmission,
  Inventory,
  DroppedItem,
  sequelize,
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
    console.error(error);
    res.status(500).send("Error loading quests.");
  }
};

exports.show = async (req, res) => {
  try {
    const questId = req.params.id;
    const { status, msg } = req.query;

    const currentUser = req.user || req.session.user;
    const userId = currentUser ? currentUser.id : null;

    const quest = await Quest.findByPk(questId, {
      include: [
        {
          model: Quiz,
          attributes: ["id", "title", "xpReward"],
        },
        {
          model: Homework,
          include: [
            { model: HomeworkMaterial },
            {
              model: HomeworkSubmission,
              required: false,
              where: { userId: userId },
            },
          ],
        },
      ],
      order: [[{ model: Homework }, "endDate", "ASC"]],
    });

    if (!quest) {
      return res.status(404).render("error", { message: "Quest not found." });
    }

    let isEnrolled = false;
    let isCompleted = false;

    if (currentUser) {
      const hero = await Hero.findOne({
        where: { userId: currentUser.id },
      });

      if (hero) {
        const [heroQuest, created] = await HeroQuest.findOrCreate({
          where: { heroId: hero.id, questId: quest.id },
          defaults: { status: "started" },
        });

        isEnrolled = true;

        if (heroQuest.status === "completed") {
          isCompleted = true;
        }
      }
    }

    res.render("quests/show", {
      title: quest.title,
      quest: quest,
      isEnrolled: isEnrolled,
      isCompleted: isCompleted,
      alertType: status,
      alertMessage: msg,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading quest.");
  }
};

exports.showQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const userId = req.user
      ? req.user.id
      : req.session.user
        ? req.session.user.id
        : null;

    const quiz = await Quiz.findOne({
      where: { id: quizId, questId: id },
      include: [
        {
          model: Question,
          include: [{ model: Answer, attributes: ["id", "text"] }],
        },
      ],
    });

    if (!quiz) return res.status(404).send("Quiz not found.");

    let jokerCount = 0;
    let elixirCount = 0;
    let scrollCount = 0;

    if (userId) {
      jokerCount = await Inventory.count({
        where: { userId: userId, isUsed: false },
        include: [{ model: DroppedItem, where: { name: "Жокера" } }],
      });

      elixirCount = await Inventory.count({
        where: { userId: userId, isUsed: false },
        include: [
          { model: DroppedItem, where: { name: "Еликсир на паметта" } },
        ],
      });

      scrollCount = await Inventory.count({
        where: { userId: userId, isUsed: false },
        include: [
          { model: DroppedItem, where: { name: "Свитък на Мъдростта" } },
        ],
      });
    }

    res.render("quests/quiz", {
      title: quiz.title,
      questId: id,
      quiz: quiz,
      jokerCount: jokerCount,
      elixirCount: elixirCount,
      scrollCount: scrollCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading quiz.");
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const userId = req.user ? req.user.id : req.session.user.id;
    const userAnswers = req.body;

    const useScroll = req.body.useScroll === "on";

    const quiz = await Quiz.findOne({
      where: { id: quizId, questId: id },
      include: [{ model: Question, include: [Answer] }],
    });

    if (!quiz) return res.status(404).send("Quiz not found.");

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
      where: { userId: userId, quizId: quizId, isPassed: true },
    });

    let xpAwarded = 0;
    let coinsAwarded = 0;
    let message = "";
    let scrollUsed = false;

    if (isCurrentAttemptSuccess) {
      if (!alreadyPassed) {
        const hero = await Hero.findOne({ where: { userId: userId } });

        if (hero) {
          let rewardXP = quiz.xpReward || 50;
          let rewardCoins = totalPoints;

          if (useScroll) {
            const scrollItem = await Inventory.findOne({
              where: { userId: userId, isUsed: false },
              include: [
                { model: DroppedItem, where: { name: "Свитък на Мъдростта" } },
              ],
            });

            if (scrollItem) {
              rewardXP *= 2;
              rewardCoins *= 2;

              scrollItem.isUsed = true;
              await scrollItem.save();
              scrollUsed = true;
            }
          }

          hero.xp += rewardXP;
          await hero.save();

          const [balance] = await HeroBalance.findOrCreate({
            where: { heroId: hero.id, questId: id },
            defaults: { amount: 0 },
          });

          balance.amount += rewardCoins;
          await balance.save();

          xpAwarded = rewardXP;
          coinsAwarded = rewardCoins;

          message = `Поздравления! Мисията изпълнена: +${rewardXP} XP и +${rewardCoins} KC!`;
          if (scrollUsed) {
            message += " (Използван Свитък на Мъдростта: x2 Бонус!)";
          }
        }
      } else {
        message =
          "Тестът е преминат успешно! (XP и KC вече са получени при предишен опит)";
      }
    } else {
      message = "Слаб резултат. Опитай пак! (Минимум 30% за преминаване)";
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
      scrollUsed: scrollUsed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing results.");
  }
};

exports.useJoker = async (req, res) => {
  try {
    const userId = req.user
      ? req.user.id
      : req.session.user
        ? req.session.user.id
        : null;
    const { questionId } = req.body;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Не сте логнат." });

    const jokerItem = await Inventory.findOne({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Жокера" } }],
    });

    if (!jokerItem) {
      return res
        .status(400)
        .json({ success: false, message: "Нямаш налични Жокери!" });
    }

    jokerItem.isUsed = true;
    await jokerItem.save();

    const question = await Question.findByPk(questionId, { include: [Answer] });
    if (!question) return res.status(404).json({ success: false });

    const correctAnswer = question.Answers.find((a) => a.isCorrect);
    const wrongAnswers = question.Answers.filter((a) => !a.isCorrect);
    const randomWrong =
      wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    const idsToKeep = [correctAnswer.id, randomWrong.id];

    const remainingJokers = await Inventory.count({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Жокера" } }],
    });

    return res.json({
      success: true,
      keepIds: idsToKeep,
      remainingJokers: remainingJokers,
    });
  } catch (error) {
    console.error("Joker Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Грешка при използване на жокера." });
  }
};

exports.useElixir = async (req, res) => {
  try {
    const userId = req.user
      ? req.user.id
      : req.session.user
        ? req.session.user.id
        : null;
    const { questionId } = req.body;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Не сте логнат." });

    const elixirItem = await Inventory.findOne({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Еликсир на паметта" } }],
    });

    if (!elixirItem) {
      return res
        .status(400)
        .json({ success: false, message: "Нямаш наличен Еликсир на паметта!" });
    }

    elixirItem.isUsed = true;
    await elixirItem.save();

    const question = await Question.findByPk(questionId, { include: [Answer] });
    if (!question) return res.status(404).json({ success: false });

    const correctAnswer = question.Answers.find((a) => a.isCorrect);

    if (!correctAnswer)
      return res.status(500).json({
        success: false,
        message: "Грешка с въпроса (няма верен отговор).",
      });

    const remainingElixirs = await Inventory.count({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Еликсир на паметта" } }],
    });

    return res.json({
      success: true,
      correctAnswerId: correctAnswer.id,
      remainingElixirs: remainingElixirs,
    });
  } catch (error) {
    console.error("Elixir Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Грешка при използване на еликсира." });
  }
};
