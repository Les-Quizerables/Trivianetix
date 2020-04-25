const cookieController = {};

cookieController.setCookie = (req, res, next) => {
  const { username } = req.body;
  res.cookie('username', username, {httpOnly: false});
  return next();
}

module.exports = cookieController;
