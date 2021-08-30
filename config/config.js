module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./.data/development_sqlite.db",
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    // logging: false,
  },
};
