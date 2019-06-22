const fs = require('fs')
const Hapi = require('hapi')
const config = require('../config')
const ports = config('ports')
const versionConfig = config('hapi_version')
const join = require('path').join
const merge = require('lodash').merge
// const HapiApiVersion = require('hapi-api-version')

const Bluebird = require('bluebird')

module.exports = class HapiServer {
  constructor (label, options = {}) {
    options.serverOptions = options.serverOptions || {}
    options.basePath = join('/', options.basePath || label, '/')
    options.sendResponseErrorLogsOnly = options.sendResponseErrorLogsOnly && true

    // Set server options
    merge(options.serverOptions, { port: ports[label], routes: { cors: true } })
    this.versionConfig = versionConfig['api']
    this.server = new Hapi.Server(options.serverOptions)
  }
  // Build routes
  route (dir = false) {
    this.versionConfig.validVersions.forEach((version) => {
      const basepath = join('/api', `/v${version}/`)
      const versionPath = join(__dirname, '..', basepath)

      return fs
        .readdirSync(versionPath)
        .forEach(async file => {
          if (file === '.DS_Store') return
          let routes = require(join(versionPath, file, 'routes'))
          routes = await Bluebird.map(routes, (route) => {
            route.config.notes = [].concat(route.config.notes)
            route.path = join(basepath, route.path)
            return route
          })

          this.server.route(routes)
        })
    })
  }

  async start () {
    await this.setup()
    await this.server.start()
    console.log(['initialize'], `Server running at ${this.server.info.uri}`)
  }
}
