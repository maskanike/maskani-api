module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'Receipts',
        'InvoiceId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'Invoices',
            key: 'id'
          }
        },
        { transaction }
      )
      await queryInterface.removeColumn('Receipts', 'UnitId', { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'Receipts',
        'UnitId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'Units',
            key: 'id'
          }
        },
        { transaction }
      )
      await queryInterface.removeColumn('Receipts', 'InvoiceId', {
        transaction
      })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
