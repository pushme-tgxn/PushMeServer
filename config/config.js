module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./.data/development_sqlite.db",
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "mariadb",
    dialectOptions: {
      ssl: false,
    },
    logging: false,
  },
};
