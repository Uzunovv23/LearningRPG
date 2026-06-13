var express = require("express");
var router = express.Router();
var adminController = require("../controllers/adminController");
var fileController = require("../controllers/fileController");
var upload = require("../middleware/upload");

var isAdmin = require("../middleware/isAdmin");
var isLogged = require("../middleware/isLogged");

router.use(isLogged);
router.use(isAdmin);

router.get("/create-quest", adminController.showCreateQuestForm);
router.post("/create-quest", adminController.createQuest);

router.get("/quests/:id/edit", adminController.editQuestForm);
router.post("/quests/:id/edit", adminController.updateQuest);

router.post(
  "/toggle-quest-completion/:id",
  adminController.toggleQuestCompletion,
);
router.post("/delete-quest/:id", adminController.deleteQuest);

router.delete("/quizzes/:id", adminController.deleteQuiz);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.toggleUserRole);
router.post("/users/:id/update", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/homework/create", adminController.createHomeworkPage);
router.post(
  "/homework/create",
  upload.array("materials", 5),
  adminController.storeHomework,
);

router.get("/homework/:id/edit", adminController.editHomeworkPage);
router.post(
  "/homework/:id/edit",
  upload.array("materials", 5),
  adminController.updateHomework,
);
router.post("/homework/:id/delete", isAdmin, adminController.deleteHomework);

router.get(
  "/homework/:id/submissions",
  adminController.viewHomeworkSubmissions,
);
router.post("/submission/:id/grade", adminController.gradeHomeworkSubmission);

//router.get("/cheat/give-all-items", isLogged, adminController.giveCheatItems);

module.exports = router;
