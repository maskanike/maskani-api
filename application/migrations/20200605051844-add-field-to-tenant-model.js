module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Tenants', 'lastInvoiceSentId', { type: Sequelize.INTEGER, }, { transaction });
      await queryInterface.addColumn('Tenants', 'flatName', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('Tenants', 'unitName', { type: Sequelize.STRING }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Tenants', 'lastInvoiceSentId', { type: Sequelize.INTEGER, }, { transaction });
      await queryInterface.removeColumn('Tenants', 'flatName', { type: Sequelize.STRING }, { transaction });
      await queryInterface.removeColumn('Tenants', 'unitName', { type: Sequelize.STRING }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
