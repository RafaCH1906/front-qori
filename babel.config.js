const path = require("path");

module.exports = function (api) {
  api.cache(true);

  if (!process.env.EXPO_ROUTER_APP_ROOT) {
    const projectRoot = process.cwd();
    const appRoot = path.resolve(__dirname, "app");
    let relativeAppRoot = path
      .relative(projectRoot, appRoot)
      .replace(/\\/g, "/");

    if (!relativeAppRoot.startsWith(".")) {
      relativeAppRoot = `./${relativeAppRoot}`;
    }

    process.env.EXPO_ROUTER_APP_ROOT = relativeAppRoot;
  }

  const resolveFromMobile = (moduleName) =>
    require.resolve(moduleName, { paths: [__dirname] });

  return {
    presets: [
      resolveFromMobile("babel-preset-expo"),
      resolveFromMobile("nativewind/babel"),
    ],
  };
};
