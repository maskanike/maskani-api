module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Receipts', 'UnitId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Units',
        key: 'id'
      }
    }),

  down: (queryInterface) => queryInterface.removeColumn('Receipts', 'UnitId')
}
