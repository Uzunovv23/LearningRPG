const { Quest, Quiz, Question, Answer } = require('../models');

exports.showCreateQuestForm = (req, res) => {
  res.render('admin/create_quest', { title: 'Създаване на Куест' });
};

exports.createQuest = async (req, res) => {
  try {
    const { title, description, xpReward, quizzes } = req.body;

    await Quest.create({
      title,
      description,
      xpReward,
      isActive: true,
      Quizzes: quizzes 
    }, {
      include: [{
        model: Quiz,
        include: [{
          model: Question,
          include: [Answer]
        }]
      }]
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Грешка при запис.' });
  }
};