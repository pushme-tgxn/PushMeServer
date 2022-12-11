const express = require("express");
const fs = require("fs").promises;

const {
  createPushRequest,
  recordPushResponse,
  getPushStatus,
  getPushStatusPoll,
} = require("../controllers/push");

async function loadPlugins(router) {
  // get all plugins
  const pluginDirList = await fs.readdir("./src/plugins");
  console.error(`Found plugins: ${pluginDirList}`);
  // load all plugin routes
  const pluginsRouter = express.Router();

  for (const plugin of pluginDirList) {
    const pluginPath = `../plugins/${plugin}/index.js`;

    console.error(`Loading plugin: ${pluginPath}`);
    const pluginRoutes = require(pluginPath);

    pluginsRouter.use(pluginRoutes.routes());
  }

  router.use(pluginsRouter);
}

module.exports = loadPlugins;
