'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Tenants', 'lastReceiptSentAt', { type: Sequelize.DATE }, { transaction });
      await queryInterface.addColumn('Tenants', 'lastInvoiceSentAt', { type: Sequelize.DATE }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Tenants', 'lastReceiptSentAt', { transaction });
      await queryInterface.removeColumn('Tenants', 'lastInvoiceSentAt', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
