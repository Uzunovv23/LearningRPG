const {
  Quest,
  Quiz,
  Question,
  Answer,
  Score,
  User,
  Hero,
  ShopItem,
  Purchase,
  HeroBalance,
  Homework,
  HomeworkMaterial,
  HomeworkSubmission,
  SubmissionFile,
  Inventory,
  DroppedItem,
  sequelize,
} = require("../models");

const giveRewards = async (userId, submissionId, grade, t) => {
  let itemsCount = 0;

  await Inventory.destroy({
    where: {
      submissionId: submissionId,
      isUsed: false,
    },
    transaction: t,
  });

  if (grade === 5) itemsCount = 1;
  if (grade === 6) itemsCount = 2;

  if (itemsCount > 0) {
    const randomItems = await DroppedItem.findAll({
      order: sequelize.random(),
      limit: itemsCount,
      transaction: t,
    });

    for (const item of randomItems) {
      await Inventory.create(
        {
          userId: userId,
          itemId: item.id,
          submissionId: submissionId,
          isUsed: false,
        },
        { transaction: t },
      );
    }

    return randomItems.length;
  }
  return 0;
};

exports.showCreateQuestForm = (req, res) => {
  res.render("admin/create_quest", { title: "Създаване на Куест" });
};

exports.createQuest = async (req, res) => {
  try {
    const { title, description, xpReward, quizzes } = req.body;

    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes) {
        if (quiz.Questions && quiz.Questions.length > 0) {
          for (const q of quiz.Questions) {
            if (!q.text || q.text.trim() === "") {
              return res.status(400).json({
                success: false,
                message: "Не можете да създадете куест с празен въпрос!",
              });
            }
            const hasCorrectAnswer =
              q.Answers &&
              q.Answers.some(
                (a) => a.isCorrect === true || a.isCorrect === "true",
              );
            if (!hasCorrectAnswer) {
              return res.status(400).json({
                success: false,
                message: `Въпросът "${q.text}" няма маркиран верен отговор!`,
              });
            }
          }
        }
      }
    }

    await Quest.create(
      {
        title,
        description,
        xpReward,
        isActive: true,
        Quizzes: quizzes,
      },
      {
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
      },
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Грешка при запис." });
  }
};

exports.editQuestForm = async (req, res) => {
  try {
    const quest = await Quest.findByPk(req.params.id, {
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
      order: [
        [Quiz, "createdAt", "ASC"],
        [Quiz, Question, "createdAt", "ASC"],
        [Quiz, Question, Answer, "id", "ASC"],
      ],
    });

    if (!quest) {
      return res.status(404).send("Куестът не е намерен.");
    }

    if (quest.Quizzes) {
      await Promise.all(
        quest.Quizzes.map(async (quiz) => {
          const count = await Score.count({
            col: "userId",
            distinct: true,
            where: { quizId: quiz.id },
          });
          quiz.dataValues.attemptCount = count;
        }),
      );
    }

    res.render("admin/edit_quest", {
      title: "Редактиране на Куест",
      quest: quest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при зареждане.");
  }
};

exports.updateQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const { title, description, xpReward, quizzes } = req.body;

    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes) {
        if (quiz.Questions && quiz.Questions.length > 0) {
          for (const q of quiz.Questions) {
            if (!q.text || q.text.trim() === "") {
              return res.status(400).json({
                success: false,
                message: "Не можете да запазите празен въпрос!",
              });
            }
            const hasCorrectAnswer =
              q.Answers &&
              q.Answers.some(
                (a) => a.isCorrect === true || a.isCorrect === "true",
              );
            if (!hasCorrectAnswer) {
              return res.status(400).json({
                success: false,
                message: `Въпросът "${q.text}" няма маркиран верен отговор!`,
              });
            }
          }
        }
      }
    }

    await Quest.update(
      { title, description, xpReward },
      { where: { id: questId } },
    );

    if (quizzes && quizzes.length > 0) {
      for (const quizData of quizzes) {
        if (quizData.id) {
          await Quiz.update(
            { title: quizData.title, xpReward: quizData.xpReward },
            { where: { id: quizData.id } },
          );

          if (quizData.Questions && quizData.Questions.length > 0) {
            await Question.destroy({ where: { quizId: quizData.id } });

            for (const q of quizData.Questions) {
              await Question.create(
                {
                  text: q.text,
                  points: q.points,
                  quizId: quizData.id,
                  Answers: q.Answers,
                },
                { include: [Answer] },
              );
            }
          }
        } else {
          await Quiz.create(
            {
              title: quizData.title,
              xpReward: quizData.xpReward,
              questId: questId,
              Questions: quizData.Questions,
            },
            {
              include: [
                {
                  model: Question,
                  include: [Answer],
                },
              ],
            },
          );
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Грешка при обновяване." });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const deleted = await Quiz.destroy({
      where: { id: quizId },
    });

    if (deleted) {
      res.json({ success: true });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Разделът не е намерен." });
    }
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Сървърна грешка при изтриване." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.render("admin/users_list", {
      title: "Управление на потребители",
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при зареждане на потребителите.");
  }
};

exports.toggleUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newRole } = req.body;

    const userToUpdate = await User.findByPk(userId);

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Потребителят не е намерен." });
    }

    if (userToUpdate.role === "admin" && newRole === "user") {
      const adminCount = await User.count({ where: { role: "admin" } });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "Внимание: Не можете да премахнете правата на последния администратор! Системата трябва да има поне един админ.",
        });
      }
    }

    await User.update({ role: newRole }, { where: { id: userId } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Грешка при смяна на роля." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;

    await User.update({ username, email }, { where: { id: userId } });

    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при обновяване.");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id == userId) {
      return res.status(400).json({
        success: false,
        message: "Не можете да изтриете собствения си профил!",
      });
    }

    const userToDelete = await User.findByPk(userId);

    if (!userToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Потребителят не е намерен." });
    }

    if (userToDelete.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Не можете да изтриете администратор! Първо променете ролята му на 'Потребител'.",
      });
    }

    await User.destroy({ where: { id: userId } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Грешка при изтриване." });
  }
};

exports.deleteQuest = async (req, res) => {
  try {
    const questId = req.params.id;
    const quest = await Quest.findByPk(questId);

    if (!quest) {
      return res.status(404).send("Куестът не е намерен.");
    }

    await quest.destroy();

    console.log(`Quest ${questId} and ALL related data deleted cleanly.`);
    res.redirect("/quests");
  } catch (error) {
    console.error("Delete Quest Error:", error);
    res.status(500).send("Грешка при изтриване: " + error.message);
  }
};

exports.toggleQuestCompletion = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const questId = req.params.id;
    const quest = await Quest.findByPk(questId, { transaction: t });

    if (!quest) {
      await t.rollback();
      return res.status(404).send("Куестът не е намерен.");
    }

    if (quest.isCompleted) {
      await t.rollback();
      return res.redirect("/quests");
    }

    quest.isCompleted = true;
    await quest.save({ transaction: t });

    const quizzes = await Quiz.findAll({
      where: { questId: quest.id },
      include: [{ model: Question, attributes: ["points"] }],
      transaction: t,
    });

    let totalMaxPoints = 0;
    quizzes.forEach((quiz) => {
      if (quiz.Questions) {
        quiz.Questions.forEach((q) => {
          totalMaxPoints += q.points;
        });
      }
    });
    if (totalMaxPoints === 0) totalMaxPoints = 100;

    const gradesCount = quest.requiredGradesCount || 3;

    const price6 = Math.ceil((totalMaxPoints * 0.85) / gradesCount);
    const price5 = Math.ceil((totalMaxPoints * 0.7) / gradesCount);
    const price4 = Math.ceil((totalMaxPoints * 0.5) / gradesCount);
    const price3 = Math.ceil((totalMaxPoints * 0.3) / gradesCount);

    const itemsTemplate = [
      {
        title: `Оценка Отличен (6)`,
        cost: price6,
        description: `Цена за 1 бр. Общо ${gradesCount} бр. за оформяне изискват ~85% от всички точки.`,
        icon: "fa-trophy text-warning",
      },
      {
        title: `Оценка Мн. Добър (5)`,
        cost: price5,
        description: `Цена за 1 бр. Общо ${gradesCount} бр. за оформяне изискват ~70% от всички точки.`,
        icon: "fa-medal text-primary",
      },
      {
        title: `Оценка Добър (4)`,
        cost: price4,
        description: `Цена за 1 бр. Общо ${gradesCount} бр. за оформяне изискват ~50% от всички точки.`,
        icon: "fa-award text-success",
      },
      {
        title: `Оценка Среден (3)`,
        cost: price3,
        description: `Цена за 1 бр. Общо ${gradesCount} бр. за оформяне изискват ~30% от всички точки.`,
        icon: "fa-ribbon text-danger",
      },
    ];

    for (const tpl of itemsTemplate) {
      await ShopItem.findOrCreate({
        where: { title: tpl.title, questId: quest.id },
        defaults: { ...tpl, questId: quest.id, isActive: true },
        transaction: t,
      });
    }

    console.log(
      `Quest '${quest.title}' LOCKED permanently. Shop items created.`,
    );

    await t.commit();
    res.redirect("/quests");
  } catch (error) {
    await t.rollback();
    console.error("Lock Quest Error:", error);
    res.status(500).send("Грешка при завършване на предмета.");
  }
};

exports.createHomeworkPage = async (req, res) => {
  try {
    const activeQuests = await Quest.findAll({
      where: { isCompleted: false },
    });

    res.render("admin/homework/create", {
      title: "Добави Домашно",
      quests: activeQuests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при зареждане.");
  }
};

exports.storeHomework = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, questId, startDate, endDate } = req.body;
    const files = req.files;

    const newHomework = await Homework.create(
      {
        title,
        description,
        questId,
        startDate,
        endDate,
      },
      { transaction: t },
    );

    if (files && files.length > 0) {
      const fileData = files.map((file) => ({
        fileName: file.originalname,
        filePath: file.filename,
        mimeType: file.mimetype,
        homeworkId: newHomework.id,
      }));

      await HomeworkMaterial.bulkCreate(fileData, { transaction: t });
    }

    await t.commit();

    res.redirect(
      `/quests/${questId}?status=success&msg=Домашното+е+публикувано+успешно!`,
    );
  } catch (error) {
    await t.rollback();
    console.error("Create Homework Error:", error);
    res.redirect("/admin/homework/create?status=error");
  }
};

exports.editHomeworkPage = async (req, res) => {
  try {
    const homeworkId = req.params.id;
    const homework = await Homework.findByPk(homeworkId, {
      include: [
        { model: Quest, attributes: ["id", "title"] },
        { model: HomeworkSubmission },
      ],
    });

    if (!homework) {
      return res.status(404).send("Домашното не е намерено.");
    }

    const hasGraded =
      homework.HomeworkSubmissions &&
      homework.HomeworkSubmissions.some(
        (sub) => sub.grade !== null || sub.status === "graded",
      );

    if (hasGraded) {
      return res.redirect(
        `/quests/${homework.questId}?status=error&msg=${encodeURIComponent("Не можете да редактирате домашно, което вече има оценени работи.")}`,
      );
    }

    if (new Date() > new Date(homework.endDate)) {
      return res.redirect(
        `/quests/${homework.questId}?status=error&msg=${encodeURIComponent("Срокът на домашното е изтекъл и то вече не може да бъде редактирано.")}`,
      );
    }

    const formatForInput = (dateObj) => {
      if (!dateObj) return "";
      const d = new Date(dateObj);
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        "T" +
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0")
      );
    };

    homework.startDateFormatted = formatForInput(homework.startDate);
    homework.endDateFormatted = formatForInput(homework.endDate);

    res.render("admin/homework/edit", {
      title: "Редактиране на Домашно",
      homework: homework,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Грешка при зареждане на страницата за редакция.");
  }
};

exports.updateHomework = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const homeworkId = req.params.id;
    const { title, description, startDate, endDate } = req.body;
    const files = req.files;

    const homework = await Homework.findByPk(homeworkId, {
      include: [{ model: HomeworkSubmission }],
      transaction: t,
    });

    if (!homework) {
      await t.rollback();
      return res.status(404).send("Домашното не е намерено.");
    }

    const hasGraded =
      homework.HomeworkSubmissions &&
      homework.HomeworkSubmissions.some(
        (sub) => sub.grade !== null || sub.status === "graded",
      );

    if (hasGraded) {
      await t.rollback();
      return res.redirect(
        `/quests/${homework.questId}?status=error&msg=${encodeURIComponent("Не можете да редактирате домашно, което вече има оценени работи.")}`,
      );
    }

    if (new Date() > new Date(homework.endDate)) {
      await t.rollback();
      return res.redirect(
        `/quests/${homework.questId}?status=error&msg=${encodeURIComponent("Срокът на домашното е изтекъл и запазването на промените е блокирано.")}`,
      );
    }

    homework.title = title;
    homework.description = description;
    homework.startDate = startDate;
    homework.endDate = endDate;
    await homework.save({ transaction: t });

    if (files && files.length > 0) {
      const fileData = files.map((file) => ({
        fileName: file.originalname,
        filePath: file.filename,
        mimeType: file.mimetype,
        homeworkId: homework.id,
      }));
      await HomeworkMaterial.bulkCreate(fileData, { transaction: t });
    }

    await HomeworkSubmission.update(
      { status: "pending" },
      {
        where: { homeworkId: homework.id },
        transaction: t,
      },
    );

    await t.commit();
    res.redirect(
      `/quests/${homework.questId}?status=success&msg=Домашното+е+редактирано+успешно!`,
    );
  } catch (error) {
    await t.rollback();
    console.error("Update Homework Error:", error);
    res.redirect(`/admin/homework/${req.params.id}/edit?status=error`);
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    const homeworkId = req.params.id;
    const homework = await Homework.findByPk(homeworkId, {
      include: [{ model: HomeworkSubmission }],
    });

    if (!homework) {
      return res.status(404).send("Домашното не е намерено.");
    }

    const hasGraded = homework.HomeworkSubmissions.some(
      (sub) => sub.grade !== null || sub.status === "graded",
    );
    if (hasGraded) {
      return res.redirect(
        `/quests/${homework.questId}?status=error&msg=${encodeURIComponent("Не можете да изтриете домашно, което вече има оценени работи!")}`,
      );
    }

    await homework.destroy();

    res.redirect(
      `/quests/${homework.questId}?status=success&msg=${encodeURIComponent("Домашното беше изтрито успешно!")}`,
    );
  } catch (error) {
    console.error("Delete Homework Error:", error);
    res.status(500).send("Грешка при изтриване на домашното.");
  }
};

exports.viewHomeworkSubmissions = async (req, res) => {
  try {
    const homeworkId = req.params.id;

    const homework = await Homework.findByPk(homeworkId, {
      include: [
        {
          model: HomeworkSubmission,
          include: [
            {
              model: User,
              attributes: ["username", "email"],
              include: [
                {
                  model: Hero,
                  attributes: ["name"],
                },
              ],
            },
            {
              model: SubmissionFile,
            },
          ],
        },
      ],
      order: [[{ model: HomeworkSubmission }, "updatedAt", "DESC"]],
    });

    if (!homework) {
      return res.status(404).send("Домашното не е намерено.");
    }

    res.render("admin/homework/submissions", {
      title: `Предавания: ${homework.title}`,
      homework: homework,
    });
  } catch (error) {
    console.error("Admin View Submissions Error:", error);
    res.status(500).send("Грешка при зареждане на предаванията.");
  }
};

exports.gradeHomeworkSubmission = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const submissionId = req.params.id;
    const { grade, feedback } = req.body;
    const gradeNum = parseInt(grade);

    const submission = await HomeworkSubmission.findByPk(submissionId, {
      transaction: t,
    });

    if (!submission) {
      await t.rollback();
      return res.status(404).send("Предаването не е намерено.");
    }

    submission.grade = gradeNum;
    submission.feedback = feedback || null;
    await submission.save({ transaction: t });

    const rewardsCount = await giveRewards(
      submission.userId,
      submission.id,
      gradeNum,
      t,
    );

    let message = "Оценката е обновена!";
    if (gradeNum >= 5) {
      message += ` Наличните бонуси са актуализирани: ${rewardsCount} артефакт(а).`;
    } else {
      message +=
        " Бонусите от това домашно бяха премахнати (ако не са използвани).";
    }

    await t.commit();

    res.redirect(
      `/admin/homework/${submission.homeworkId}/submissions?success=${encodeURIComponent(message)}`,
    );
  } catch (error) {
    await t.rollback();
    console.error("Grade Submission Error:", error);
    res.status(500).send("Грешка при оценяване.");
  }
};

/*
exports.giveCheatItems = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;

    if (req.user.role !== 'admin') {
      throw new Error("Тази магия е достъпна само за Боговете (Админите)!");
    }

    const allItems = await DroppedItem.findAll({ transaction: t });

    if (allItems.length === 0) {
      await t.rollback();
      return res.status(404).send("Няма създадени предмети в базата (DroppedItems)!");
    }

    const cheatInventoryRecords = [];

    for (const item of allItems) {
      for (let i = 0; i < 10; i++) {
        cheatInventoryRecords.push({
          userId: userId,     
          itemId: item.id,
          isUsed: false,       
          isLocked: false     
        });
      }
    }

    
    await Inventory.bulkCreate(cheatInventoryRecords, { transaction: t });

   
    await t.commit();

    
    res.send(`<h1>God Mode Активиран! ⚡</h1><p>Успешно добавени <b>${cheatInventoryRecords.length}</b> артефакта в инвентара ти!</p><a href="/users/my-hero">Обратно към Героя</a>`);

  } catch (error) {
    await t.rollback();
    console.error("Cheat Code Error:", error);
    res.status(500).send(`Грешка при изпълнение на cheat кода: ${error.message}`);
  }
};
*/
