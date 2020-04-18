require('dotenv').config();

const pgDbObject = {
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: '127.0.0.1',
  port: '5432',
  dialect: 'postgres',
};

module.exports = {
  development: { ...pgDbObject },
  test: { ...pgDbObject, database: process.env.TEST_DB_NAME },
  sandbox: { ...pgDbObject, database: 'maskani_sb' },
  production: { ...pgDbObject, database: 'maskani_prod' },
};
