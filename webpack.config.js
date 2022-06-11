import configure from "webpack-config-jaid"

/**
 * @type {import("webpack").Configuration}
 */
const extra = {
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