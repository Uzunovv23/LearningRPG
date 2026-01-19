const { ShopItem, Hero, Purchase } = require("../models");

exports.getShop = async (req, res) => {
  try {
    const items = await ShopItem.findAll({
      where: { isActive: true },
      order: [["cost", "ASC"]],
    });

    const { status, item } = req.query;
    let message = null;
    let messageType = null;

    if (status === "success") {
      message = `Успешна покупка! Вече притежаваш този предмет.`;
      messageType = "success";
    } else if (status === "no_funds") {
      message = "Нямаш достатъчно Knowcoins за тази покупка!";
      messageType = "danger";
    } else if (status === "error") {
      message = "Възникна грешка при транзакцията.";
      messageType = "danger";
    }

    res.render("shop/index", {
      title: "Магазин за награди",
      items: items,
      hero: req.user ? req.user.Hero : null,
      alertMessage: message,
      alertType: messageType,
    });
  } catch (error) {
    console.error("Shop Error:", error);
    res
      .status(500)
      .render("error", { message: "Грешка при зареждане на магазина." });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const user = req.user;

    if (!user || !user.Hero) {
      return res.redirect("/shop?status=error");
    }

    const hero = user.Hero;
    const item = await ShopItem.findByPk(itemId);

    if (!item) {
      return res.redirect("/shop?status=error");
    }

    if (hero.knowcoins < item.cost) {
      return res.redirect("/shop?status=no_funds");
    }

    hero.knowcoins -= item.cost;
    await hero.save();

    await Purchase.create({
      userId: user.id,
      shopItemId: item.id,
      status: "pending",
    });

    res.redirect(`/shop?status=success`);
  } catch (error) {
    console.error("Buy Error:", error);
    res.redirect("/shop?status=error");
  }
};

exports.seedShop = async (req, res) => {
  try {
    const items = [
      {
        title: "Оценка Отличен (6)",
        description: "Купи си пълна шестица.",
        cost: 1000,
        icon: "fa-certificate text-success",
      },
      {
        title: "Оценка Много Добър (5)",
        description: "Много добра оценка.",
        cost: 600,
        icon: "fa-star text-primary",
      },
      {
        title: "Оценка Добър (4)",
        description: "Златната среда.",
        cost: 300,
        icon: "fa-check-circle text-info",
      },
      {
        title: "Оценка Среден (3)",
        description: "За да минеш.",
        cost: 100,
        icon: "fa-life-ring text-warning",
      },
    ];

    for (const item of items) {
      await ShopItem.findOrCreate({
        where: { title: item.title },
        defaults: item,
      });
    }
    res.redirect("/shop");
  } catch (error) {
    console.error(error);
    res.status(500).send("Seed Error");
  }
};
