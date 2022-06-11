import readableMs from "readable-ms"
import yargs from "yargs"
import {hideBin} from "yargs/helpers" // eslint-disable-line node/file-extension-in-import -- This is not a real file path, this is a resolve shortcut defined in node_modules/yargs/package.json[exports][./helpers]

import core from "./core.js"

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
  const plugins = {}
  const pluginsRequire = require.context("./plugins/", true, /^\.\/\w+\/index.js$/)
  for (const value of pluginsRequire.keys()) {
    const {pluginName} = value.match(/[/\\](?<pluginName>.+?)[/\\]index\.js$/).groups
    plugins[pluginName] = pluginsRequire(value).default
  }
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