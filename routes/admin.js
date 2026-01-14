var express = require("express");
var router = express.Router();
var adminController = require("../controllers/adminController");
var isAdmin = require("../middleware/isAdmin");

router.use(isAdmin);

router.get("/create-quest", adminController.showCreateQuestForm);
router.post("/create-quest", adminController.createQuest);

router.get("/quests/:id/edit", adminController.editQuestForm);
router.post("/quests/:id/edit", adminController.updateQuest);

router.delete("/quizzes/:id", adminController.deleteQuiz);

module.exports = router;
