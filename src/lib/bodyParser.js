import bodyParser from "koa-bodyparser"

import {config} from "../core.js"

export default bodyParser({
  formLimit: config.apiPayloadLimit,
  textLimit: config.apiPayloadLimit,
  jsonLimit: config.apiPayloadLimit,
  strict: false,
})