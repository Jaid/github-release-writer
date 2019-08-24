import {config, logger} from "src/core"
import {createProbot} from "probot"
import hasContent from "has-content"
import fsp from "@absolunet/fsp"

/**
 * @typedef {Object} WebhookRepository
 * @prop {number} id
 * @prop {string} name
 * @prop {string} full_name
 * @prop {boolean} private
 * @prop {string} html_url
 * @prop {string} description
 * @prop {boolean} fork
 * @prop {string} url
 * @prop {string} git_url
 * @prop {string} ssh_url
 * @prop {string} clone_url
 * @prop {string} homepage
 * @prop {number} size
 * @prop {number} stargazers_count
 * @prop {number} watchers_count
 * @prop {string} language
 * @prop {boolean} has_issues
 * @prop {boolean} has_projects
 * @prop {boolean} has_downloads
 * @prop {boolean} has_wiki
 * @prop {boolean} has_pages
 * @prop {number} forks_count
 * @prop {boolean} archived
 * @prop {boolean} disabled
 * @prop {number} open_issues_count
 * @prop {number} open_issues
 * @prop {string} default_branch
 */

/**
 * @typedef {Object} WebhookRelease
 * @prop {string} url
 * @prop {string} assets_url
 * @prop {string} upload_url
 * @prop {string} html_url
 * @prop {number} id
 * @prop {string} tag_name
 * @prop {string} target_commitish
 * @prop {string} name
 * @prop {boolean} draft
 * @prop {boolean} prerelease
 * @prop {string} created_at
 * @prop {string} published_at
 * @prop {string} tarball_url
 * @prop {string} zipball_url
 * @prop {string} body
 */

/**
 * @typedef {Object} WebhookPayload
 * @prop {"published"|"unpublished"|"created"|"edited"|"deleted"|"prereleased"} action
 * @prop {WebhookRelease} release
 * @prop {WebhookRepository} repository
 */

/**
 * @callback ReleaseEvent
 * @param {import("probot/lib/context").Context<WebhookPayload>} context
 * @return {Promise<void>}
 */

/**
 * @type {import("probot").ApplicationFunction}
 */
const probotApp = app => {
  app.on("release.created (not in use)", /** @type {ReleaseEvent} */ async context => {
    const {release, repository} = context.payload
    const name = `${context.payload.repository.full_name} ${release.tag_name}`
    if (release.draft) {
      logger.info("Skipping %s, it is a draft", name)
      return
    }
    if (release.prerelease) {
      logger.info("Skipping %s, it is a prerelease", name)
      return
    }
    await context.github.repos.updateRelease({
      release_id: release.id,
      owner: repository.owner.login,
      repo: repository.name,
      body: "123",
    })
  })
  app.on("push", /** @type {ReleaseEvent} */ async context => {
    debugger
  //   const {release, repository} = context.payload
  //   const name = `${context.payload.repository.full_name} ${release.tag_name}`
  //   if (release.draft) {
  //     logger.info("Skipping %s, it is a draft", name)
  //     return
  //   }
  //   if (release.prerelease) {
  //     logger.info("Skipping %s, it is a prerelease", name)
  //     return
  //   }
  //   await context.github.repos.updateRelease({
  //     release_id: release.id,
  //     owner: repository.owner.login,
  //     repo: repository.name,
  //     body: "123",
  //   })
  })
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
    this.probot.load(probotApp)
    this.probot.start()
  }

}