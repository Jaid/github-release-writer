import fsp from "@absolunet/fsp"
import {Probot, Server} from "probot"

import {config, logger} from "src/core"

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
    const privateKey = await fsp.readFile(config.pemFilePath, "utf8")
    const server = new Server({
      Probot: Probot.defaults({
        privateKey,
        secret: config.webhookSecret,
        appId: config.githubAppId,
        port: config.webhookPort,
      }),
    })
    logger.info("GitHub app %s is listening to webhook port %s", config.githubAppId, config.webhookPort)
    await server.load(probotApp)
    server.start()
  }

}