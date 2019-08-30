import {logger} from "src/core"
import json5 from "json5"
import semver from "semver"
import hasContent from "has-content"
import {capitalize} from "lodash"
import generateChangelog from "lib/generateChangelog"

/**
 * @param {import("probot").Context} context
 * @param {import("@octokit/rest").ReposGetContentsParams} fetchOptions
 * @return {Promise<Object>}
 */
async function getPackageJson(context, fetchOptions) {
  let content
  try {
    const response = await context.github.repos.getContents({
      ...fetchOptions,
      path: "package.json",
    })
    content = Buffer.from(response.data.content, response.data.encoding).toString("utf8")
  } catch (error) {
    logger.debug("Could not fetch package.json: %s", error)
    return null
  }
  try {
    const json = json5.parse(content)
    return json
  } catch (error) {
    logger.debug("Could not parse package.json: %s", error)
    return null
  }
}

/**
 * @param {import("probot").Context<import("@octokit/webhooks").Webhooks.WebhookPayloadPush>} context
 * @return {Promise<void>}
 */
async function handlePush(context) {
  const {payload} = context
  if (payload.ref !== "refs/heads/master") {
    logger.debug("Ref is not \"refs/heads/master\", skipping")
    return
  }
  if (!payload.before) {
    logger.debug("payload.before is %s", payload.before)
    return
  }
  const commits = payload.commits
  const modifiedFiles = new Set
  for (const commit of commits) {
    if (hasContent(commit?.modified)) {
      Set.prototype.add.apply(modifiedFiles, commit.modified)
    }
  }
  if (!modifiedFiles.has("package.json")) {
    logger.debug("package.json not modified in this push, skipping")
    return
  }
  const ownerName = payload.repository.owner.login
  const repoName = payload.repository.name
  const fetchPkgJobs = [payload.before, payload.after].map(ref => {
    return getPackageJson(context, {
      ref,
      owner: ownerName,
      repo: repoName,
    })
  })
  const fetchPkgResponse = await Promise.all(fetchPkgJobs)
  let beforePkg = fetchPkgResponse[0]
  const afterPkg = fetchPkgResponse[1]
  const beforeVersion = semver.valid(beforePkg?.version)
  if (beforeVersion === null) {
    logger.debug("Semver in before-version package.json is invalid")
    return
  }
  const afterVersion = semver.valid(afterPkg?.version)
  if (afterVersion === null) {
    logger.debug("Semver in after-version package.json is invalid")
    return
  }
  if (semver.lte(afterVersion, beforeVersion)) {
    logger.debug("New version %s is not higher than old version %s", afterVersion, beforeVersion)
    return
  }
  logger.info("Version got bumped from %s to %s", beforeVersion, afterVersion)
  const bumpWeight = semver.diff(afterVersion, beforeVersion)
  if (!["patch", "minor", "major"].includes(bumpWeight)) {
    logger.debug("Bump weight is none of \"patch\", \"minor\" and \"major\"")
    return
  }
  const beforeTagName = `v${beforeVersion}`
  const afterTagName = `v${afterVersion}`
  let beforeTag
  try {
    const tagResponse = await context.github.repos.getCommit({
      owner: ownerName,
      repo: repoName,
      ref: beforeTagName,
    })
    beforeTag = tagResponse.data
    beforeTag.name = beforeTagName
  } catch {}
  if (!beforeTag) {
    const tagsList = await context.github.repos.listTags({
      per_page: 1,
      owner: ownerName,
      repo: repoName,
    })
    beforeTag = tagsList.data[0]
    if (!beforeTag) {
      logger.warn("No relevant tag found, stopping process")
      return
    }
    beforePkg = await getPackageJson(context, {
      owner: ownerName,
      repo: repoName,
      ref: beforeTag.name,
    })
    logger.warn("Release for tag %s not found, using latest tag %s instead", beforeTagName, beforeTag.name)
  }
  const {data: comparison} = await context.github.repos.compareCommits({
    owner: ownerName,
    repo: repoName,
    base: beforeTag.name,
    head: payload.after,
  })
  const projectName = afterPkg.title || afterPkg.name || repoName
  const markdownChangelog = generateChangelog({
    payload,
    projectName,
    comparison,
    beforeTag,
    ownerName,
    repoName,
    afterTagName,
  })
  await context.github.repos.createRelease({
    body: markdownChangelog,
    name: `[${capitalize(bumpWeight)}] ${projectName} ${afterVersion}`,
    owner: ownerName,
    repo: repoName,
    tag_name: afterTagName,
    target_commitish: payload.after,
  })
  debugger
}

export default handlePush