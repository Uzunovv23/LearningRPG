const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Hero } = require("../models");

// Register

exports.showRegisterForm = (req, res) => {
  res.render("register", { title: "Регистрация" });
};

exports.register = async (req, res, next) => { 
  const { username, email, password } = req.body;

  // - минимум 6 символа (.{6,})
  // - поне една малка буква (?=.*[a-z])
  // - поне една главна буква (?=.*[A-Z])
  // - поне едно число (?=.*\d)
  // - поне един специален знак (?=.*[\W_])
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

  // Проверка дали паролата отговаря на условията
  if (!passwordRegex.test(password)) {
    return res.render("register", {
      title: "Регистрация",
      error: "Паролата трябва да е минимум 6 символа и да съдържа главна буква, малка буква, число и специален знак.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: req.body.role,
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

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.render("login", {
        title: "Вход",
        error: "Грешен имейл или парола! Моля, опитайте отново.",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
