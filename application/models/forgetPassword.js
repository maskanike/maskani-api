module.exports = (sequelize, DataTypes) => {
  const ForgotPassword = sequelize.define('ForgotPassword', {
    email: DataTypes.STRING,
    verification: DataTypes.STRING,
    ipRequest: DataTypes.STRING,
    browserRequest: DataTypes.STRING,
    countryRequest: DataTypes.STRING,
  }, {});
  return ForgotPassword;
};
