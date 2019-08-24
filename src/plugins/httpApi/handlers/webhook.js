import {logger} from "src/core"

/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  const requestBody = context.request.body
  logger.info("%o", requestBody)
  context.body = "ok"
}

export default middleware