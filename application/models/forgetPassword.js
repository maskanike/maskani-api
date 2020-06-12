module.exports = (sequelize, DataTypes) => {
  const ForgotPassword = sequelize.define(
    'ForgotPassword',
    {
      email: {
        type: DataTypes.STRING,
        isEmail: true,
        isLowercase: true,
        notNull: true
      },
      verification: DataTypes.STRING,
      ipRequest: DataTypes.STRING,
      browserRequest: DataTypes.STRING,
      countryRequest: DataTypes.STRING,
      used: { type: DataTypes.BOOLEAN, defaultValue: false },
      ipChanged: DataTypes.STRING,
      browserChanged: DataTypes.STRING,
      countryChanged: DataTypes.STRING
    },
    {}
  )
  return ForgotPassword
}
