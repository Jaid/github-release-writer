import JaidCore from "jaid-core"

import defaults from "./config.yml"

const core = new JaidCore({
  name: _PKG_TITLE,
  version: _PKG_VERSION,
  useGot: true,
  insecurePort: 39410,
  configSetup: {
    defaults,
    secretKeys: [
      "githubClientId",
      "githubClientSecret",
      "webhookSecret",
    ],
  },
})

/**
 * @typedef {Object} Config
 * @prop {string} githubClientId
 * @prop {string} githubClientSecret
 * @prop {string} webhookSecret
 * @prop {number} githubAppId
 * @prop {number} webhookPort
 */

/**
 * @type {import("jaid-logger").JaidLogger}
 */
export const logger = core.logger

/**
 * @type {import("got").GotInstance}
 */
export const got = core.got

/**
 * @type {import("jaid-core").BaseConfig & Config}
 */
export const config = core.config

/**
 * @type {string}
 */
export const appFolder = core.appFolder

/**
 * @type {import("koa")}
 */
export const koa = core.koa

export default core