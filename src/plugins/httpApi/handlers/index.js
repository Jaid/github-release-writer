/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  context.body = `<pre>Hello! I am:\n${_PKG_TITLE} v${_PKG_VERSION}</pre>`
}

export default middleware