import ensureArray from "ensure-array"
import camelCase from "camel-case"

import template from "./markdown.hbs"
import commitTypes from "./commitTypes.yml"

/**
 * @typedef {Object} CommitType
 * @prop {string[]} prefix
 * @prop {string} title
 * @prop {string} emoji
 */

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
 */

/**
 * @param {Options} options
 * @return {string}
 */
export default options => {
  const authors = {}
  const commitCategories = {}
  for (const {author, commit, sha} of options.comparison.commits) {
    commit.sha = sha
    commit.shortSha = sha.substring(0, 6)
    const authorId = String(author.id)
    if (!authors.hasOwnProperty(authorId)) {
      authors[authorId].commits++
    } else {
      authors[authorId] = {
        // id
        // profile pic url
        // login
        commits: 1,
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
            title: commitType.title,
            emoji: commitType.emoji,
          }
        }
        commitCategories[commitTypeId].commits.push(commit)
      }
      commit.message = /.*/.exec(commit.message)[0].trim()
    }
  }
  const templateContext = {
    commitCategories,
    ...options,
    authorCounts: authorCounter.toObjectSortedByValues(),
  }
  return template(templateContext)
}