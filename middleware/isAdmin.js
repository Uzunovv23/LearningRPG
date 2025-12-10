module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  if (req.user.role === "admin") {
    return next();
  }

  res.status(403).send("Достъп отказан! Тази страница е само за учители.");
};
