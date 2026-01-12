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
          attributes: ['id', 'title'] 
        },
      ],
    });

    if (!quest) {
      return res.status(404).render("error", { message: "Quest not found." });
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
    res.status(500).send("Error loading quest.");
  }
};

exports.showQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;

    // Find the specific quiz
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
    const userId = req.user.id;
    const userAnswers = req.body;

    const quiz = await Quiz.findOne({
      where: { id: quizId, questId: id },
      include: [
        {
          model: Question,
          include: [Answer],
        },
      ],
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
          (a) => a.id === Number(submittedAnswerId)
        );

        if (pickedAnswer?.isCorrect) {
          totalPoints += qPoints;
          correctCount++;
        }
      }
    });

    await Score.create({
      points: totalPoints,
      userId: userId,
      questId: id,
    });

    res.render("quests/result", {
      title: "Quiz Result",
      questTitle: quiz.title,
      points: totalPoints,
      maxPoints: maxPoints,
      correctCount: correctCount,
      xpEarned: 0, 
    });

  } catch (error) {
    console.error("Error in submitQuiz:", error);
    res.status(500).send("Error processing results.");
  }
};