module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Statements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.INTEGER
      },
      balance: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM(
          'payment',
          'invoice',
          'missed_credit',
          'missed_debit'
        )
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      TenantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tenants',
          key: 'id'
        }
      }
    }),
  down: (queryInterface) => queryInterface.dropTable('Statements')
}
