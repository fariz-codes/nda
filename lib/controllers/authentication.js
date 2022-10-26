const { _redirectToAuthentication } = require('../models/redirector');

const _login = (req, res) => {
  _redirectToAuthentication({ successMsg: '', errMsg: '' }, res);
};

module.exports = {
  _login
};