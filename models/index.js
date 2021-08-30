const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

// heroku config
let sequelize;
if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: true,
    },
    logging: true,
  });
} else {
  // local config
  const env = process.env.NODE_ENV || "development";
  const config = require(__dirname + "/../config/config.json")[env];
  sequelize = new Sequelize(config);
}

const db = {};

const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // const model = sequelize['import'](path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
