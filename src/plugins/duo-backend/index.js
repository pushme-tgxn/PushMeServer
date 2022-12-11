const routes = require("./routes.js");

const name = "duo-backend";

const version = "1.0.0";

const addPluginRoutes = async (options) => {
  const router = express.Router();
  router.use("/auth/v2", routes);
  return router;
};

module.exports = {
  name,
  version,
  routes: addPluginRoutes,
};
