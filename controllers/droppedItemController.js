const { DroppedItem } = require("../models");

exports.index = async (req, res) => {
  try {
    const items = await DroppedItem.findAll();
    const currentUser = req.user || req.session.user;

    res.render("droppedItems/index", {
      title: "Арсенал на Знанието",
      items: items,
      currentUser: currentUser,
    });
  } catch (error) {
    console.error("Error fetching dropped items:", error);
    res.status(500).send("Грешка при зареждане на предметите.");
  }
};
