module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'Tenants',
      [
        {
          name: 'sam',
          email: 'samuel@flatspad.com',
          rent: 20000,
          deposit: 25000,
          balance: 0,
          garbage: 400,
          water: 700,
          penalty: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          FlatId: 1
        },
        {
          rent: 10000,
          deposit: 15000,
          balance: 0,
          garbage: 340,
          water: 500,
          penalty: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'joan',
          email: 'joan@flatspad.com',
          FlatId: 1
        },
        {
          rent: 12000,
          deposit: 17000,
          balance: 0,
          garbage: 690,
          water: 600,
          penalty: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'Jane Doe',
          email: 'jane@example.com',
          FlatId: 1
        }
      ],
      {}
    ),

  down: (queryInterface) => queryInterface.bulkDelete('Tenants', null, {})
}
