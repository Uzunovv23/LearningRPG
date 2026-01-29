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
    const userId = req.user.id; 

    const homework = await Homework.findByPk(homeworkId, {
      include: [
        { model: Quest, attributes: ["title"] }, 
        { model: HomeworkMaterial },
        { 
            model: HomeworkSubmission, 
            required: false, 
            where: { userId: userId },
            include: [SubmissionFile] 
        } 
      ],
    });

    if (!homework) {
      return res.render("error", { message: "Домашното не е намерено." });
    }

    const mySubmission = homework.HomeworkSubmissions[0] || null;

    res.render("users/homework/show", {
      title: homework.title,
      homework: homework,
      submission: mySubmission,
      query: req.query,
      currentUser: req.user 
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

    const isExpired = new Date(homework.endDate) < new Date();
    if (isExpired) {
      return res.redirect(
        `/users/homework/${homeworkId}?error=Срокът+е+изтекъл!`,
      );
    }

    let [submission, created] = await HomeworkSubmission.findOrCreate({
      where: {
        userId: userId,
        homeworkId: homeworkId,
      },
      defaults: { submissionText: "" },
    });

    if (submissionText !== undefined) {
      submission.submissionText = submissionText;
      await submission.save();
    }

    if (files && files.length > 0) {
      const fileData = files.map((f) => ({
        fileName: f.originalname,
        filePath: f.filename,
        mimeType: f.mimetype,
        submissionId: submission.id,
      }));

      await SubmissionFile.bulkCreate(fileData);
    }

    res.redirect(
      `/users/homework/${homeworkId}?success=Решението+е+запазено+успешно!`,
    );
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

    const isExpired =
      new Date(file.HomeworkSubmission.Homework.endDate) < new Date();
    if (isExpired) {
      return res.redirect(
        `/users/homework/${file.HomeworkSubmission.homeworkId}?error=Срокът+е+изтекъл!`,
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

    const homeworkId = file.HomeworkSubmission.homeworkId;
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
