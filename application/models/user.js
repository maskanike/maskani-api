const bcrypt = require('bcrypt')

const hashPassword = (user) => {
  const salt = bcrypt.genSaltSync()
  user.password = bcrypt.hashSync(user.password, salt)
  return user
}
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        isEmail: true,
        isLowercase: true,
        notNull: true
      },
      phone: { type: DataTypes.STRING, field: 'msisdn' },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: DataTypes.ENUM('active', 'pending', 'deleted'),
      role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
      userType: DataTypes.ENUM('landlord', 'agent', 'tenant'),
      verification: DataTypes.STRING,
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      loginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      blockExpires: { type: DataTypes.DATE, defaultValue: sequelize.NOW }
    },
    {
      hooks: {
        beforeCreate: (user) => hashPassword(user),
        beforeBulkCreate: (users) =>
          users.forEach((user) => {
            hashPassword(user)
          }),
        beforeUpdate: (user) => hashPassword(user)
      }
    }
  )
  User.prototype.comparePassword = function (password, cb) {
    return bcrypt.compare(password, this.password, (err, isMatch) =>
      err ? cb(err) : cb(null, isMatch)
    )
  }
  return User
}
