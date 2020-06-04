module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Tenants', 'paymentStatus', { type: Sequelize.ENUM('fully_paid', 'has_dues', 'defaulted'), }, { transaction });
      await queryInterface.addColumn('Tenants', 'lastPaymentMadeAt', { type: Sequelize.DATE }, { transaction });
      await queryInterface.addColumn('Invoices', 'status', { type: Sequelize.ENUM('paid', 'unpaid', 'partially_paid'), }, { transaction });
      await queryInterface.addColumn('Invoices', 'dueDate', { type: Sequelize.DATE }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Tenants', 'paymentStatus', { transaction });
      await queryInterface.removeColumn('Tenants', 'lastPaymentMadeAt', { transaction });
      await queryInterface.removeColumn('Invoices', 'status', { transaction });
      await queryInterface.removeColumn('Invoices', 'dueDate', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
