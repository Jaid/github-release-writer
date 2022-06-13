import configure from "webpack-config-jaid"

/**
 * @type {import("webpack").Configuration}
 */
const extra = {
  output: {
    asyncChunks: true,
    chunkFormat: "module",
    chunkLoading: "import",
    clean: true,
    filename: "[name].js",
    chunkFilename: "[id].js",
  },
  optimization: {
    removeAvailableModules: true,
    runtimeChunk: {
      name: "runtime",
    },
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        defaultVendors: {
          test: /[/\\]node_modules[/\\]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  module: {
    parser: {
      javascript: {
        importMeta: true,
        importMetaContext: true,
      },
    },
  },
}

export default configure({extra})