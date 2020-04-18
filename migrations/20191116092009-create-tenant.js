module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Tenants', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    rent: {
      type: Sequelize.INTEGER,
    },
    deposit: {
      type: Sequelize.INTEGER,
    },
    balance: {
      type: Sequelize.INTEGER,
    },
    water: {
      type: Sequelize.INTEGER,
    },
    garbage: {
      type: Sequelize.INTEGER,
    },
    penalty: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.ENUM('unchanged', 'changed', 'left'),
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    UserId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    FlatId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Flats',
        key: 'id',
      },
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Tenants'),
};
