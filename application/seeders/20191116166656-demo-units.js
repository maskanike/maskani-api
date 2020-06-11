module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Units', [{
    id: 1,
    name: '3E/07',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    FlatId: 1,
    TenantId: 2,
  },
  {
    id: 2,
    name: '3E/01',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    FlatId: 1,
    TenantId: 3,
  },
  {
    id: 3,
    name: '3E/02',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    FlatId: 1,
  },
  {
    id: 4,
    name: '3E/03',
    status: 'active',
    FlatId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ], {}),

  down: (queryInterface) => queryInterface.bulkDelete('Units', null, {}),
};
