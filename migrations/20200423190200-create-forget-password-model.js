module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ForgotPasswords', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.STRING,
    },
    verification: {
      type: Sequelize.STRING,
    },
    ipRequest: {
      type: Sequelize.STRING,
    },
    browserRequest: {
      type: Sequelize.STRING,
    },
    countryRequest: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('ForgotPasswords'),
};
