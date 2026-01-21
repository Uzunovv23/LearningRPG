const {
  Quest,
  Quiz,
  Question,
  Answer,
  Score,
  User,
  ShopItem,
} = require("../models");

exports.showCreateQuestForm = (req, res) => {
  res.render("admin/create_quest", { title: "Създаване на Куест" });
};

exports.createQuest = async (req, res) => {
  try {
    const { title, description, xpReward, quizzes } = req.body;

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

    await ShopItem.destroy({ where: { questId: quest.id } });

    await Quiz.destroy({ where: { questId: quest.id } });

    await quest.destroy();

    res.redirect("/quests");
  } catch (error) {
    console.error("Delete Quest Error:", error);
    res.status(500).send("Грешка при изтриване на куеста.");
  }
};
