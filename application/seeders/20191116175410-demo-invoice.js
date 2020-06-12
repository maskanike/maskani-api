module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'Invoices',
      [
        {
          rent: 100,
          water: 0,
          garbage: 0,
          penalty: 0,
          TenantId: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: (queryInterface) => queryInterface.bulkDelete('Invoices', null, {})
}
