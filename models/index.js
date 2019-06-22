const pg = require('pg')
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const config = require('config')('database', true)
const JoiSequelize = require('libs/joi-sequelize')

const basename = path.basename(module.filename)

let db = null

const options = {
  host: config.host,
  dialect: config.dialect,
  define: {
    paranoid: true,
    underscored: true,
    underscoredAll: true,
    defaultScope: {
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    }
  },
  logging: false,
  pool: { acquire: 60000 },
  operatorsAliases: false
}

// Bluebird.config({ longStackTraces: true });
delete pg.native // Remove pg-native getter
pg.defaults.parseInt8 = true // Convert BIGINT string return to integer
pg.types.setTypeParser(1700, 'text', parseFloat) // Convert NUMERIC string return to float

exports.init = () => {
  db = {}
  let JS = {}

  db.sequelize = new Sequelize(config.database, config.username, config.password, options)
  db.JS = JS

  fs
    .readdirSync(__dirname)
    .filter(file =>
      file.indexOf('.') !== 0 && file !== basename &&
        file.slice(-3) === '.js' && file !== '.DS_Store'
    )
    .forEach(file => {
      let model = db.sequelize.import(path.join(__dirname, file))
      db[model.name] = model
      JS[model.name] = new JoiSequelize(require(path.join(__dirname, file)))
    })

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db)
    if (db[modelName].addScopes) db[modelName].addScopes(db)
    if (db[modelName].addHooks) db[modelName].addHooks(db)
  })

  return db
}

module.exports = db || exports.init()
