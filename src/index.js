import yargs from "yargs"

import {hideBin} from "../node_modules/yargs/helpers/helpers.mjs" // HACK Switch to yargs' ESM resolve shortcut "yargs/helpers" some day, but not now, it's not well supported by ESLint and webpack
import core from "./core.js"
import readableMs from "./lib/esm/readable-ms.js"

/**
 * @param {*} message
 * @param {string} [level="info"]
 */
const log = (message, level = "info") => {
  if (core?.logger?.[level]) {
    core.logger[level](message)
  } else {
    console[level](message)
  }
}

process.on("exit", code => {
  log(`Exiting with code ${code} after ${readableMs(Date.now() - core.startTime)}`)
})

/**
 * @return {Promise<void>}
 */
const job = async () => {
  const pluginsRequire = import.meta.webpackContext("./plugins", {
    mode: "lazy",
    regExp: /^\.\/\w+\/index.js$/,
  })
  const loaders = pluginsRequire.keys().map(async value => {
    const plugin = await pluginsRequire(value)
    return [
      value.match(/[/\\](.+?)[/\\]index\.js$/)[1],
      plugin.default,
    ]
  })
  const entries = await Promise.all(loaders)
  const plugins = Object.fromEntries(entries)
  await core.init(plugins)
}

/**
 * @type {import("yargs").CommandBuilder}
 */
const builder = {
}

try {
  await yargs(hideBin(process.argv))
    .scriptName(process.env.REPLACE_PKG_NAME)
    .version(process.env.REPLACE_PKG_VERSION)
    .command("$0", process.env.REPLACE_PKG_DESCRIPTION, builder, job)
    .parse()
} catch (error) {
  log("Unhandled error", "error")
  log(error, "error")
}