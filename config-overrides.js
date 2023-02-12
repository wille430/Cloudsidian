const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    webpack: (config) => {
        config.plugins = [
            ...config.plugins,
            new NodePolyfillPlugin()
        ]

        const scopePluginIndex = config.resolve.plugins.findIndex(
            ({constructor}) => constructor && constructor.name === 'ModuleScopePlugin'
        );

        config.resolve.plugins.splice(scopePluginIndex, 1);

        return config
    },
}
