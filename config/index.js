const { join } = require('path')

module.exports = (file, useNodeEnv = false) => {
  const env = !useNodeEnv ? null : (process.env.NODE_ENV || 'development')
  const config = require(join(__dirname, file))

  return !env ? config : config[env]
}
