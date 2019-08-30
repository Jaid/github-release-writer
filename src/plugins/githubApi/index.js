import {config, logger} from "src/core"
import {createProbot} from "probot"
import fsp from "@absolunet/fsp"

import handlePush from "./handlePush"

/**
 * @callback ReleaseEvent
 * @param {import("@octokit/webhooks").Webhooks.WebhookPayloadPush} context
 * @return {Promise<void>}
 */

/**
 * @type {import("probot").ApplicationFunction}
 */
const probotApp = app => {
  app.on("push", handlePush)
}

export default class GithubApi {

  async init() {
    const cert = await fsp.readFile(config.pemFilePath, "utf8")
    this.probot = createProbot({
      cert,
      secret: config.webhookSecret,
      id: config.githubAppId,
      port: config.webhookPort,
    })
    logger.info("GitHub app %s is listening to webhook port %s", config.githubAppId, config.webhookPort)
    this.probot.load(probotApp)
    this.probot.start()
  }

}