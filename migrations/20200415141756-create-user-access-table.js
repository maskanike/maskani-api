module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserAccesss', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.STRING,
    },
    ip: {
      type: Sequelize.STRING,
    },
    browser: {
      type: Sequelize.STRING,
    },
    country: {
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
  down: (queryInterface) => queryInterface.dropTable('UserAccesss'),
};
