const fs = require("fs").promises;

async function loadPlugins(router) {
  // get all plugins
  const pluginDirList = await fs.readdir("./controllers/");
  console.error(`Found plugins: ${pluginDirList}`);
  // load all plugin routes
  const pluginsApi = {};

  for (const plugin of pluginDirList) {
    var isDir = fs.statSync(plugin).isDirectory();
    console.error(`Found plugin: ${plugin} isDir: ${isDir}`);

    const pluginPath = `./controllers/${plugin}`;

    const pluginRoutes = require(pluginPath);

    pluginsApi[plugin] = pluginRoutes;
  }

  router.use(pluginsRouter);
}

module.exports = loadPlugins;

function addPluginsRecusively(router, plugins) {
  for (const plugin of plugins) {
    const pluginPath = `../plugins/${plugin}/index.js`;

    console.error(`Loading plugin: ${pluginPath}`);
    const pluginRoutes = require(pluginPath);

    router.use(pluginRoutes.routes());
  }
}
