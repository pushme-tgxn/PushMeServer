module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./.data/development_sqlite.db",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: true,
    },
    logging: true,
  },
};