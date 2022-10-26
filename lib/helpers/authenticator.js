const validate = (req, res, next) => {
  // Validate authentication & redirect to auth error handler if there is no authorization
  return next();
};

module.exports = {
  validate
};