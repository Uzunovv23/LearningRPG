const fs = require("fs");
const path = require("path");
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
  HomeworkMaterial,
  HomeworkSubmission,
  SubmissionFile,
  Inventory,
  DroppedItem,
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

    const inventory = await Inventory.findAll({
      where: {
        userId: userId,
        isUsed: false,
      },
      include: [DroppedItem],
    });
    const allDroppedItems = await DroppedItem.findAll();

    const groupedInventory = allDroppedItems.map(item => {
      const count = inventory.filter(inv => inv.DroppedItem && inv.DroppedItem.id === item.id).length;
      return {
        item: item,
        count: count
      };
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

    const avatarIcons = [
      "fa-user-graduate",
      "fa-book-reader",
      "fa-user-ninja",
      "fa-user-astronaut",
      "fa-user-secret",
      "fa-mask",
      "fa-khanda",
      "fa-hat-wizard",
      "fa-dragon",
      "fa-crown",
    ];

    res.render("users/my_hero", {
      title: "Моят Герой",
      hero: hero,
      journal: journal,
      inventory: inventory,
      groupedInventory: groupedInventory,
      avatarIcons: avatarIcons,
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
    const userId = req.user.id;

    const homework = await Homework.findByPk(homeworkId, {
      include: [
        { model: Quest, attributes: ["title"] },
        { model: HomeworkMaterial },
        {
          model: HomeworkSubmission,
          required: false,
          where: { userId: userId },
          include: [SubmissionFile],
        },
      ],
    });

    if (!homework) {
      return res.render("error", { message: "Домашното не е намерено." });
    }

    const mySubmission = homework.HomeworkSubmissions[0] || null;

    let chronoCount = 0;
    let latePassCount = 0;

    if (userId) {
      chronoCount = await Inventory.count({
        where: { userId: userId, isUsed: false },
        include: [{ model: DroppedItem, where: { name: "Пясъчен часовник" } }],
      });

      latePassCount = await Inventory.count({
        where: { userId: userId, isUsed: false },
        include: [
          { model: DroppedItem, where: { name: "Билет за Закъснение" } },
        ],
      });
    }

    res.render("users/homework/show", {
      title: homework.title,
      homework: homework,
      submission: mySubmission,
      query: req.query,
      currentUser: req.user,
      chronoCount: chronoCount,
      latePassCount: latePassCount,
    });
  } catch (error) {
    console.error("Get Homework Error:", error);
    res.render("error", { message: "Грешка при зареждане на домашното." });
  }
};

exports.submitHomework = async (req, res) => {
  try {
    const homeworkId = req.params.id;
    const userId = req.user.id;
    const files = req.files;
    const { submissionText } = req.body;

    const homework = await Homework.findByPk(homeworkId);
    if (!homework) return res.status(404).send("Няма такова домашно");

    let [submission, created] = await HomeworkSubmission.findOrCreate({
      where: {
        userId: userId,
        homeworkId: homeworkId,
      },
      defaults: {
        submissionText: "",
        extensionHours: 0,
        usedLatePass: false,
        status: "pending",
      },
    });

    const effectiveDeadline = new Date(homework.endDate);
    if (submission.extensionHours) {
      effectiveDeadline.setHours(
        effectiveDeadline.getHours() + submission.extensionHours,
      );
    }

    const now = new Date();
    let isExpired = now > effectiveDeadline;
    let usedLatePassNow = false;

    if (isExpired) {
      const latePassItem = await Inventory.findOne({
        where: { userId: userId, isUsed: false },
        include: [
          { model: DroppedItem, where: { name: "Билет за Закъснение" } },
        ],
      });

      if (latePassItem) {
        latePassItem.isUsed = true;
        await latePassItem.save();

        usedLatePassNow = true;
        isExpired = false;
        submission.usedLatePass = true;
      } else {
        return res.redirect(
          `/users/homework/${homeworkId}?error=Срокът+е+изтекъл+и+нямате+Билет+за+Закъснение!`,
        );
      }
    }

    if (submissionText !== undefined) {
      submission.submissionText = submissionText;
    }

    submission.status = "submitted";
    await submission.save();

    if (files && files.length > 0) {
      const fileData = files.map((f) => ({
        fileName: f.originalname,
        filePath: f.filename,
        mimeType: f.mimetype,
        submissionId: submission.id,
      }));

      await SubmissionFile.bulkCreate(fileData);
    }

    let msg = "Решението+е+запазено+успешно!";
    if (usedLatePassNow) msg += "+(Използван+Билет+за+Закъснение!)";

    res.redirect(`/users/homework/${homeworkId}?success=${msg}`);
  } catch (error) {
    console.error("Submit Homework Error:", error);
    res.redirect(`/users/homework/${req.params.id}?error=Възникна+грешка.`);
  }
};

exports.deleteSubmissionFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;

    const file = await SubmissionFile.findByPk(fileId, {
      include: {
        model: HomeworkSubmission,
        where: { userId: userId },
        include: [Homework],
      },
    });

    if (!file) {
      return res.redirect("back");
    }

    const submission = file.HomeworkSubmission;
    const effectiveDeadline = new Date(submission.Homework.endDate);
    if (submission.extensionHours) {
      effectiveDeadline.setHours(
        effectiveDeadline.getHours() + submission.extensionHours,
      );
    }

    const isExpired = effectiveDeadline < new Date();

    if (isExpired) {
      return res.redirect(
        `/users/homework/${submission.homeworkId}?error=Срокът+е+изтекъл!`,
      );
    }

    const absolutePath = path.join(
      __dirname,
      "../private_uploads",
      file.filePath,
    );
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    const homeworkId = submission.homeworkId;
    await file.destroy();

    res.redirect(`/users/homework/${homeworkId}?success=Файлът+е+изтрит.`);
  } catch (error) {
    console.error("Delete File Error:", error);
    res.redirect("back");
  }
};

exports.downloadSubmissionFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const file = await SubmissionFile.findByPk(fileId, {
      include: {
        model: HomeworkSubmission,
        include: [Homework],
      },
    });

    if (!file) {
      return res.status(404).send("Файлът не е намерен.");
    }

    const isOwner = file.HomeworkSubmission.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send("Нямате право да сваляте този файл.");
    }

    const absolutePath = path.join(
      __dirname,
      "../private_uploads",
      file.filePath,
    );

    res.download(absolutePath, file.fileName, (err) => {
      if (err) {
        console.error("File download error:", err);
        if (!res.headersSent) {
          res.status(404).send("Файлът липсва на сървъра.");
        }
      }
    });
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).send("Грешка при сваляне.");
  }
};

exports.useChronoGlass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { homeworkId } = req.body;

    const chronoItem = await Inventory.findOne({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Пясъчен часовник" } }],
    });

    if (!chronoItem) {
      return res
        .status(400)
        .json({ success: false, message: "Нямаш Пясъчен часовник!" });
    }

    const homework = await Homework.findByPk(homeworkId);
    if (!homework)
      return res
        .status(404)
        .json({ success: false, message: "Домашното не е намерено." });

    let [submission, created] = await HomeworkSubmission.findOrCreate({
      where: { userId: userId, homeworkId: homeworkId },
      defaults: { status: "pending", extensionHours: 0 },
    });

    const currentDeadline = new Date(homework.endDate);
    currentDeadline.setHours(
      currentDeadline.getHours() + (submission.extensionHours || 0),
    );

    if (new Date() > currentDeadline) {
      return res.status(400).json({
        success: false,
        message:
          "Срокът вече е изтекъл! Пясъчният часовник не действа назад във времето.",
      });
    }

    submission.extensionHours = (submission.extensionHours || 0) + 24;
    await submission.save();

    chronoItem.isUsed = true;
    await chronoItem.save();

    const remaining = await Inventory.count({
      where: { userId: userId, isUsed: false },
      include: [{ model: DroppedItem, where: { name: "Пясъчен часовник" } }],
    });

    return res.json({
      success: true,
      message: "Срокът е удължен с 24 часа!",
      remaining: remaining,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Грешка при използване на часовника." });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user
      ? req.user.id
      : req.session.user
        ? req.session.user.id
        : null;
    const { avatarIcon } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Не сте влезли в профила си." });
    }

    if (!avatarIcon) {
      return res
        .status(400)
        .json({ success: false, message: "Не е избрана иконка." });
    }

    const avatarIcons = [
      "fa-user-graduate",
      "fa-book-reader",
      "fa-user-ninja",
      "fa-user-astronaut",
      "fa-user-secret",
      "fa-mask",
      "fa-khanda",
      "fa-hat-wizard",
      "fa-dragon",
      "fa-crown",
    ];

    const requiredLevel = avatarIcons.indexOf(avatarIcon) + 1;
    if (requiredLevel === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Невалидна иконка." });
    }

    const hero = await Hero.findOne({ where: { userId: userId } });
    if (!hero) {
      return res
        .status(404)
        .json({ success: false, message: "Героят не е намерен." });
    }

    const currentLevel = Math.floor(hero.xp / 1000) + 1;

    if (currentLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Тази иконка се отключва на Ниво ${requiredLevel}. Вие сте Ниво ${currentLevel}.`,
      });
    }

    hero.avatarIcon = avatarIcon;
    await hero.save();

    return res.json({
      success: true,
      message: "Аватарът е обновен успешно!",
      icon: avatarIcon,
    });
  } catch (error) {
    console.error("Update Avatar Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Грешка при запазване на аватара." });
  }
};
