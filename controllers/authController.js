const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Hero } = require("../models");

// Register

exports.showRegisterForm = (req, res) => {
  res.render("register", { title: "Регистрация" });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await Hero.create({
      name: username,
      userId: newUser.id,
    });

    req.login(newUser, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res.render("register", {
      title: "Регистрация",
      error: "Грешка! Вероятно имейлът или името са заети.",
    });
  }
};

// Login

exports.showLoginForm = (req, res) => {
  res.render("login", { title: "Вход" });
};

exports.login = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
});

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
