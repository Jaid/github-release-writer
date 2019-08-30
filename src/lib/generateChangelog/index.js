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
  return template(options)
}