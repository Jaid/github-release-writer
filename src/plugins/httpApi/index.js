import {router} from "fast-koa-router"
import {koa, config, logger, appFolder} from "src/core"
import bodyParser from "lib/bodyParser"

export default class HttpApi {

  async init() {
    const routes = {
      get: {
        "/": require("./handlers/index").default,
      },
      post: {
        "/webhook": [bodyParser, require("./handlers/webhook").default],
      },
    }
    koa.use(router(routes))
  }

}