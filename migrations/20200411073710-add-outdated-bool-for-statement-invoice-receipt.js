
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Invoices',
        'outdated', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true, // This differs from the models default.
          // This is to allow marking all existing values in the database as outdated.
          // It will mean charts get accurate data
        }, { transaction });
      await queryInterface.addColumn('Receipts',
        'outdated', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      await queryInterface.addColumn('Statements',
        'outdated', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Invoices', 'outdated', { transaction });
      await queryInterface.removeColumn('Receipts', 'outdated', { transaction });
      await queryInterface.removeColumn('Statements', 'outdated', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
