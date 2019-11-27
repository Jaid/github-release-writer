import ensureArray from "ensure-array"
import camelCase from "camel-case"
import {sortBy} from "lodash"
import hasContent from "has-content"
import {logger} from "src/core"
import humanizeList from "humanize-list"

import template from "./markdown.hbs"
import commitTypes from "./commitTypes.yml"
import dependencyTypes from "./dependencyTypes"

/**
 * @typedef {Object} CommitType
 * @prop {string[]} prefix
 * @prop {string} title
 * @prop {string} emoji
 */

function sortCategories({id}) {
  const index = [
    "breaking",
    "feature",
    "fix",
    "improvement",
    "documentation",
    "project management",
  ].indexOf(id)
  if (index === -1) {
    return Number.MAX_SAFE_INTEGER
  } else {
    return index
  }
}

/**
 * @param {string} prefix
 * @return {CommitType}
 */
function getCommitTypeByPrefix(prefix) {
  for (const commitType of commitTypes) {
    const typePrefixes = ensureArray(commitType.prefix)
    if (typePrefixes.includes(prefix)) {
      return commitType
    }
  }
}

/**
 * @typedef {Object} Options
 * @prop {string} projectName
 * @prop {Object} beforePkg
 * @prop {Object} afterPkg
 * @prop {import("compare-dependencies").Changes} dependencyChanges
 */

/**
 * @param {Options} options
 * @return {string}
 */
export default options => {
  const authors = {}
  const commitCategories = {}
  const dependencies = {}
  if (!options.isInitialRelease) {
    for (const {author, commit, sha} of options.comparison.commits) {
      commit.sha = sha
      commit.shortSha = sha.slice(0, 6)
      const authorId = author ? String(author.id) : "other"
      if (authors.hasOwnProperty(authorId)) {
        authors[authorId].commits++
      } else if (author) {
        authors[authorId] = {
          avatar: author.avatar_url,
          url: author.html_url,
          name: author.login,
          commits: 1,
        }
      } else {
        authors.other = {
          avatar: "https://avatars3.githubusercontent.com/in/15368",
          name: "unspecified authors",
          commits: 1,
          url: "https://github.com",
        }
      }
      commit.authorData = authors[authorId]
      const regex = / *(?<prefix>\w+) *: *(?<message>.+)/s
      const parsed = regex.exec(commit.message)
      if (parsed) {
        commit.originalMessage = commit.message
        const {prefix} = parsed.groups
        const commitType = getCommitTypeByPrefix(prefix)
        commit.prefix = prefix.toLowerCase()
        if (commitType) {
          commit.message = parsed.groups.message
          const commitTypeId = camelCase(commitType.title)
          if (!commitCategories.hasOwnProperty(commitTypeId)) {
            commitCategories[commitTypeId] = {
              commits: [],
              id: commitTypeId,
              title: commitType.title,
              emoji: commitType.emoji,
            }
          }
          commitCategories[commitTypeId].commits.push(commit)
        }
        commit.message = /.*/.exec(commit.message)[0].trim()
      }
    }
    for (const [dependencyType, {title}] of Object.entries(dependencyTypes)) {
      const events = options.dependencyChanges[dependencyType]
      if (!events) {
        continue
      }
      const hasChanges = Object.values(events).some(hasContent)
      if (!hasChanges) {
        continue
      }
      logger.debug("Found changes for \"%s\"", title)
      dependencies[dependencyType] = {title}
      for (const [eventType, eventList] of Object.entries(events)) {
        if (hasContent(eventList)) {
          if (eventType === "moved") {
            dependencies[dependencyType][eventType] = eventList.map(entry => ({
              ...entry,
              oldTypesString: humanizeList(entry.oldTypes),
            }))
          } else {
            dependencies[dependencyType][eventType] = eventList
          }
        }
      }
    }
  }
  const hasDependencyChanges = Object.values(dependencies).some(hasContent)
  const templateContext = {
    ...options,
    dependencies,
    hasDependencyChanges,
    authors: sortBy(Object.values(authors), author => -author.commits),
    authorsCount: Object.entries(authors).length,
    commitCategories: sortBy(Object.values(commitCategories), sortCategories),
  }
  return template(templateContext)
}