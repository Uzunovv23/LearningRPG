"use strict";

const {
  Hero,
  Score,
  Quiz,
  Quest,
  Inventory,
  DroppedItem,
  Duel,
  DuelQuiz,
  User,
  Question,
  Answer,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

exports.getLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentHero = await Hero.findOne({ where: { userId: userId } });

    if (!currentHero) {
      return res.redirect("/users/my-hero");
    }

    const passedScores = await Score.findAll({
      where: { userId: userId, isPassed: true },
      include: [{ model: Quiz, include: [{ model: Quest }] }],
    });

    const uniqueQuizzesMap = new Map();
    passedScores.forEach((score) => {
      if (score.Quiz && !uniqueQuizzesMap.has(score.Quiz.id)) {
        uniqueQuizzesMap.set(score.Quiz.id, score.Quiz);
      }
    });
    const availableQuizzes = Array.from(uniqueQuizzesMap.values());

    const inventoryItems = await Inventory.findAll({
      where: { userId: userId, isLocked: false, isUsed: false },
      include: [{ model: DroppedItem, required: true }],
    });

    const incomingChallenges = await Duel.findAll({
      where: { opponentId: currentHero.id, status: "pending" },
      include: [
        {
          model: Hero,
          as: "Initiator",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Inventory,
          as: "InitiatorWager",
          include: [{ model: DroppedItem }],
        },
        { model: Quiz, include: [{ model: Quest }] },
      ],
    });

    const activeBattles = await Duel.findAll({
      where: {
        [Op.or]: [
          { initiatorId: currentHero.id },
          { opponentId: currentHero.id },
        ],
        status: "active",
      },
      include: [
        {
          model: Hero,
          as: "Initiator",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Hero,
          as: "Opponent",
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });

    const sentChallenges = await Duel.findAll({
      where: { initiatorId: currentHero.id, status: "pending" },
      include: [
        {
          model: Hero,
          as: "Opponent",
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });

    const battleHistory = await Duel.findAll({
      where: {
        [Op.or]: [
          { initiatorId: currentHero.id },
          { opponentId: currentHero.id },
        ],
        status: "finished",
      },
      include: [
        {
          model: Hero,
          as: "Initiator",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Hero,
          as: "Opponent",
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 5,
    });

    res.render("arena/lobby", {
      title: "⚔️ Арена - Лоби",
      hero: currentHero,
      quizzes: availableQuizzes,
      inventory: inventoryItems,
      challenges: incomingChallenges,
      activeBattles: activeBattles,
      sentChallenges: sentChallenges,
      battleHistory: battleHistory,
    });
  } catch (error) {
    console.error("Arena Lobby Error:", error);
    res.status(500).send("Грешка при зареждане на Арената.");
  }
};

exports.getMatchmaking = async (req, res) => {
  try {
    const userId = req.user.id;
    let { wagerId, quizIds } = req.query;

    if (!wagerId || !quizIds) {
      return res.redirect("/arena");
    }

    if (!Array.isArray(quizIds)) {
      quizIds = [quizIds];
    }

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    const wagerItem = await Inventory.findOne({
      where: {
        id: wagerId,
        userId: userId,
        isLocked: false,
        isUsed: false,
      },
      include: [{ model: DroppedItem }],
    });

    if (!wagerItem) {
      return res.status(400).send("Невалиден или вече заложен артефакт!");
    }

    const selectedQuizzes = await Quiz.findAll({
      where: { id: quizIds },
      include: [{ model: Quest }],
    });

    const allOtherHeroes = await Hero.findAll({
      where: {
        userId: { [Op.ne]: userId },
      },
      include: [{ model: User, attributes: ["username"] }],
    });

    const eligibleOpponents = [];

    for (const opponent of allOtherHeroes) {
      const passedCount = await Score.count({
        where: {
          userId: opponent.userId,
          quizId: quizIds,
          isPassed: true,
        },
        distinct: true,
        col: "quizId",
      });

      if (passedCount === quizIds.length) {
        eligibleOpponents.push(opponent);
      }
    }

    res.render("arena/matchmake", {
      title: "⚔️ Арена - Избор на съперник",
      hero: currentHero,
      wagerItem: wagerItem,
      selectedQuizzes: selectedQuizzes,
      opponents: eligibleOpponents,
      rawQuizIds: quizIds,
    });
  } catch (error) {
    console.error("Matchmaking Error:", error);
    res.status(500).send("Грешка при търсене на опоненти.");
  }
};

exports.postChallenge = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    let { opponentId, wagerId, quizIds } = req.body;

    if (!opponentId || !wagerId || !quizIds) {
      throw new Error("Липсват данни за създаване на дуела.");
    }

    if (!Array.isArray(quizIds)) {
      quizIds = [quizIds];
    }

    const initiator = await Hero.findOne({
      where: { userId: userId },
      transaction: t,
    });

    const opponent = await Hero.findByPk(opponentId, { transaction: t });
    if (!opponent) {
      throw new Error("Противникът не е намерен.");
    }

    const initiatorPassed = await Score.count({
      where: { userId: userId, quizId: quizIds, isPassed: true },
      distinct: true,
      col: "quizId",
      transaction: t,
    });

    const opponentPassed = await Score.count({
      where: { userId: opponent.userId, quizId: quizIds, isPassed: true },
      distinct: true,
      col: "quizId",
      transaction: t,
    });

    if (initiatorPassed < quizIds.length || opponentPassed < quizIds.length) {
      throw new Error(
        "Опит за измама: Избрани са тестове, които един от играчите не е завършил!",
      );
    }

    const wagerItem = await Inventory.findOne({
      where: {
        id: wagerId,
        userId: userId,
        isLocked: false,
        isUsed: false,
      },
      transaction: t,
    });

    if (!wagerItem) {
      throw new Error(
        "Опит за измама или невалиден залог: Този предмет не съществува, вече е използван или е заложен в друг дуел.",
      );
    }

    await wagerItem.update({ isLocked: true }, { transaction: t });

    const newDuel = await Duel.create(
      {
        status: "pending",
        initiatorId: initiator.id,
        opponentId: opponentId,
        initiatorWagerId: wagerItem.id,
      },
      { transaction: t },
    );

    const duelQuizzesData = quizIds.map((qId) => ({
      duelId: newDuel.id,
      quizId: qId,
    }));

    await DuelQuiz.bulkCreate(duelQuizzesData, { transaction: t });

    await t.commit();

    res.redirect("/arena?success=challenge_sent");
  } catch (error) {
    await t.rollback();
    console.error("Duel Creation Error:", error);
    res.status(400).send(`Грешка при създаване на дуела: ${error.message}`);
  }
};

exports.postDecline = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { duelId } = req.body;

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    const duel = await Duel.findOne({
      where: {
        id: duelId,
        opponentId: currentHero.id,
        status: "pending",
      },
      transaction: t,
    });

    if (!duel) {
      throw new Error("Дуелът не е намерен или вече не е активен.");
    }

    if (duel.initiatorWagerId) {
      await Inventory.update(
        { isLocked: false },
        { where: { id: duel.initiatorWagerId }, transaction: t },
      );
    }

    await duel.update({ status: "declined" }, { transaction: t });

    await t.commit();
    res.redirect("/arena?info=declined");
  } catch (error) {
    await t.rollback();
    console.error("Decline Duel Error:", error);
    res.status(400).send("Грешка при отказване на дуела.");
  }
};

exports.postAccept = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { duelId, opponentWagerId } = req.body;

    if (!opponentWagerId) {
      throw new Error("Трябва да избереш артефакт за залог!");
    }

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    const duel = await Duel.findOne({
      where: {
        id: duelId,
        opponentId: currentHero.id,
        status: "pending",
      },
      transaction: t,
    });

    if (!duel) {
      throw new Error("Дуелът не е намерен или вече е приет/отказан.");
    }

    const myWagerItem = await Inventory.findOne({
      where: {
        id: opponentWagerId,
        userId: userId,
        isLocked: false,
        isUsed: false,
      },
      transaction: t,
    });

    if (!myWagerItem) {
      throw new Error("Невалиден или вече заложен артефакт.");
    }

    await myWagerItem.update({ isLocked: true }, { transaction: t });

    const duelQuizzes = await DuelQuiz.findAll({
      where: { duelId: duel.id },
      transaction: t,
    });
    const quizIds = duelQuizzes.map((dq) => dq.quizId);

    const allQuestions = await Question.findAll({
      where: { quizId: quizIds },
      attributes: ["id"],
      transaction: t,
    });

    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestionIds = shuffledQuestions
      .slice(0, 10)
      .map((q) => q.id)
      .join(",");

    await duel.update(
      {
        opponentWagerId: myWagerItem.id,
        status: "active",
        questionIds: selectedQuestionIds,
      },
      { transaction: t },
    );

    await t.commit();

    res.redirect(`/arena/battle/${duel.id}`);
  } catch (error) {
    await t.rollback();
    console.error("Accept Duel Error:", error);
    res.status(400).send(`Грешка при приемане: ${error.message}`);
  }
};

exports.getBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const duelId = req.params.duelId;

    const currentHero = await Hero.findOne({ where: { userId: userId } });
    if (!currentHero) {
      return res.redirect("/users/my-hero");
    }

    const duel = await Duel.findOne({
      where: { id: duelId },
      include: [
        {
          model: Hero,
          as: "Initiator",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Hero,
          as: "Opponent",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Inventory,
          as: "InitiatorWager",
          include: [{ model: DroppedItem }],
        },
        {
          model: Inventory,
          as: "OpponentWager",
          include: [{ model: DroppedItem }],
        },
      ],
    });

    if (!duel) {
      return res.status(404).render("arena/error", {
        title: "Ненамерен дуел",
        message: "Дуелът, който се опитваш да заредиш, не съществува.",
      });
    }

    if (duel.status !== "active") {
      return res.status(400).render("arena/error", {
        title: "Неактивна битка",
        message: `Този дуел вече не е активен (Текущ статус: ${duel.status}).`,
      });
    }

    const isInitiator = duel.initiatorId === currentHero.id;
    const isOpponent = duel.opponentId === currentHero.id;

    if (!isInitiator && !isOpponent) {
      return res.status(403).render("arena/error", {
        title: "Достъпът е отказан",
        message: "Нямаш право да участваш в този дуел!",
      });
    }

    if (
      (isInitiator && duel.initiatorFinished) ||
      (isOpponent && duel.opponentFinished)
    ) {
      return res.redirect(`/arena/result/${duel.id}`);
    }

    if (!duel.questionIds) {
      return res.status(400).render("arena/error", {
        title: "Бъгната/Стара битка",
        message:
          "Тази битка няма генерирани въпроси в базата данни. Моля, върни се в лобито и създай ново предизвикателство.",
      });
    }

    const questionIdsArray = duel.questionIds.split(",").map(Number);
    const questions = await Question.findAll({
      where: { id: questionIdsArray },
      include: [{ model: Answer }],
    });

    res.render("arena/battle", {
      title: "⚔️ БИТКА",
      hero: currentHero,
      duel: duel,
      questions: questions,
    });
  } catch (error) {
    console.error("Battle Load Error:", error);
    res.status(500).render("arena/error", {
      title: "Критична грешка",
      message: `Възникна сървърна грешка: ${error.message}`,
    });
  }
};

exports.postSubmitBattle = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const duelId = req.body.duelId;

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    const duel = await Duel.findOne({
      where: { id: duelId, status: "active" },
      transaction: t,
    });

    if (!duel) {
      throw new Error("Дуелът не е намерен или вече е приключил.");
    }

    const isInitiator = duel.initiatorId === currentHero.id;
    const isOpponent = duel.opponentId === currentHero.id;

    if (!isInitiator && !isOpponent) {
      throw new Error("Нямаш право да участваш в този дуел!");
    }

    if (
      (isInitiator && duel.initiatorFinished) ||
      (isOpponent && duel.opponentFinished)
    ) {
      await t.rollback();
      return res.redirect(`/arena/result/${duel.id}`);
    }

    const questionIdsArray = duel.questionIds.split(",").map(Number);
    const questions = await Question.findAll({
      where: { id: questionIdsArray },
      include: [{ model: Answer }],
      transaction: t,
    });

    let score = 0;

    questions.forEach((q) => {
      const submittedAnswerId = parseInt(req.body[`q_${q.id}`]);
      const correctAnswer = q.Answers.find((a) => a.isCorrect === true);

      if (correctAnswer && submittedAnswerId === correctAnswer.id) {
        score += 10;
      }
    });

    if (isInitiator) {
      duel.initiatorScore = score;
      duel.initiatorFinished = true;
    } else {
      duel.opponentScore = score;
      duel.opponentFinished = true;
    }

    await duel.save({ transaction: t });

    if (duel.initiatorFinished && duel.opponentFinished) {
      let winnerId = null;

      if (duel.initiatorScore > duel.opponentScore) {
        winnerId = duel.initiatorId;
      } else if (duel.opponentScore > duel.initiatorScore) {
        winnerId = duel.opponentId;
      }

      duel.winnerId = winnerId;
      duel.status = "finished";
      await duel.save({ transaction: t });

      if (winnerId) {
        const loserWagerId =
          winnerId === duel.initiatorId
            ? duel.opponentWagerId
            : duel.initiatorWagerId;
        const winnerWagerId =
          winnerId === duel.initiatorId
            ? duel.initiatorWagerId
            : duel.opponentWagerId;

        await Inventory.update(
          { isLocked: false },
          { where: { id: winnerWagerId }, transaction: t },
        );

        const winnerHero = await Hero.findByPk(winnerId, { transaction: t });

        await Inventory.update(
          { userId: winnerHero.userId, isLocked: false, isUsed: false },
          { where: { id: loserWagerId }, transaction: t },
        );

        winnerHero.xp += 50;
        await winnerHero.save({ transaction: t });
      } else {
        await Inventory.update(
          { isLocked: false },
          {
            where: { id: [duel.initiatorWagerId, duel.opponentWagerId] },
            transaction: t,
          },
        );
      }
    }

    await t.commit();
    res.redirect(`/arena/result/${duel.id}`);
  } catch (error) {
    await t.rollback();
    console.error("Battle Submit Error:", error);
    res.status(400).send("Грешка при предаване на битката.");
  }
};

exports.getBattleResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const duelId = req.params.duelId;

    const currentHero = await Hero.findOne({ where: { userId: userId } });

    const duel = await Duel.findOne({
      where: { id: duelId },
      include: [
        {
          model: Hero,
          as: "Initiator",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Hero,
          as: "Opponent",
          include: [{ model: User, attributes: ["username"] }],
        },
        {
          model: Inventory,
          as: "InitiatorWager",
          include: [{ model: DroppedItem }],
        },
        {
          model: Inventory,
          as: "OpponentWager",
          include: [{ model: DroppedItem }],
        },
      ],
    });

    if (!duel) {
      return res.status(404).send("Дуелът не е намерен.");
    }

    const isInitiator = duel.initiatorId === currentHero.id;
    const isOpponent = duel.opponentId === currentHero.id;

    if (!isInitiator && !isOpponent) {
      return res.status(403).send("Нямаш право да гледаш този резултат!");
    }

    const isWaiting = duel.status === "active";
    let outcome = "tie";

    if (duel.status === "finished") {
      if (duel.winnerId === currentHero.id) {
        outcome = "win";
      } else if (duel.winnerId !== null) {
        outcome = "loss";
      }
    }

    res.render("arena/result", {
      title: "⚔️ Резултат от битката",
      hero: currentHero,
      duel: duel,
      isInitiator: isInitiator,
      isWaiting: isWaiting,
      outcome: outcome,
    });
  } catch (error) {
    console.error("Battle Result Error:", error);
    res.status(500).send("Грешка при зареждане на резултата.");
  }
};
