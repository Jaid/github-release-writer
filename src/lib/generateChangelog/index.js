import KeyCounter from "key-counter"
import ensureArray from "ensure-array"

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
  const authorCounter = new KeyCounter
  const commitCategories = {}
  for (const {author, commit} of options.comparison.commits) {
    authorCounter.feed(String(author.id))
    const regex = / *(?<prefix>\w+) *: *(?<message>.+)/s
    const parsed = regex.exec(commit.message)
    if (parsed) {
      commit.originalMessage = commit.message
      const {prefix} = parsed.groups
      const commitType = getCommitTypeByPrefix(prefix)
      commit.prefix = prefix.toLowerCase()
      if (commitType) {
        commit.message = parsed.groups.message
        if (!commitCategories.hasOwnProperty(commitType.title)) {
          commitCategories[commitType.title] = {
            commits: [],
            title: commitType.title,
            emoji: commitType.emoji,
          }
        }
        commitCategories[commitType.title].commits.push(commit)
      }
      commit.message = /.*/.exec(commit.message)[0].trim()
    }
  }
  return template({
    commitCategories,
    ...options,
    authorCounts: authorCounter.toObjectSortedByValues(),
  })
}