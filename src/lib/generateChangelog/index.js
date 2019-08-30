import KeyCounter from "key-counter"

import template from "./markdown.hbs"

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
  for (const {author, commit} of options.comparison.commits) {
    authorCounter.feed(author.id)
    const regex = / *(?<prefix>\w+) *: *(?<message>.*?)/s
    const parsed = regex.exec(commit.message)
    if (parsed) {
      commit.type = parsed.groups.prefix.toLowerCase()
      commit.message = parsed.groups.prefix.message
    }
    debugger
  }
  return template(options)
}