const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const comparePassword = (password, dbPassword) => {
  return bcrypt.compare(password, dbPassword);
};

module.exports = {hashPassword, comparePassword};
