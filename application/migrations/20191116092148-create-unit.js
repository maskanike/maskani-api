module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Units', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('active', 'pending', 'deleted')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      FlatId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Flats',
          key: 'id'
        }
      },
      TenantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tenants',
          key: 'id'
        }
      }
    }),
  down: (queryInterface) => queryInterface.dropTable('Units')
}
