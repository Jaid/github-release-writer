import {logger} from "src/core"

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
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  /**
   * @type {WebhookPayload}
   */
  const requestBody = context.request.body
  if (requestBody.action !== "created") {
    context.body = {message: "request.action is not \"created\""}
    return
  }
  logger.debug("%o", context.header)
  logger.debug("%o", requestBody)
  logger.info("Release %s %s", requestBody.repository.full_name, requestBody.release.tag_name)
  context.body = {message: "ok"}
}

export default middleware