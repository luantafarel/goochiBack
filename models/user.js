const Cryptr = require('cryptr')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const config = require('config')('config.json')
const cryptr = new Cryptr(config.cryptr_safeWord)
module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      description: 'User unique identification (PK)'
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'users_username_unique_idx',
      description: 'User\'s username (unique in the system)'
    },
    email: {
      type: DataTypes.STRING,
      unique: 'users_enterprise_email_unique_idx',
      description: 'User\'s email (unique by enterprise)'
    },
    last_login_at: {
      type: DataTypes.DATE,
      description: 'User\'s last login'
    },
    reset_password_token: {
      type: DataTypes.STRING(512),
      description: 'User\'s reset token to be validated'
    },
    created_at: {
      type: DataTypes.DATE,
      description: 'Record created at'
    },
    updated_at: {
      type: DataTypes.DATE,
      description: 'Record updated at'
    },
    deleted_at: {
      type: DataTypes.DATE,
      description: 'Record deleted at'
    },
    password: {
      type: DataTypes.STRING,
      description: 'User\'s password'
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: user => user.hashPassword(),
      beforeUpdate: user => {
        if (user.changed('password')) user.hashPassword()
      }
    }
  })
  if (typeof User === 'undefined') return

  User.prototype.generateToken = function (user) {
    console.log({
      id: user.id,
      username: user.username,
      exp: moment().add(config.tokenTTL, 'day').unix()
    })
    return jwt.sign({
      id: user.id,
      username: user.username,
      exp: moment().add(config.tokenTTL, 'day').unix()
    }, process.env.JWT_SECRET_KEY)
  }
  // Instance methods
  User.prototype.hashPassword = function () {
    if (this.password) {
      this.password = cryptr.encrypt(this.password)
    }
  }

  User.prototype.validPassword = function (password) {
    if (!password) {
      return false
    }
    return cryptr.decrypt(this.password) === password
  }

  User.prototype.verifyPassword = function (password) {
    if (!this.password) {
      throw new Error('instance password not setted')
    } else if (!password) {
      return false
    }
    return cryptr.decrypt(this.password) === password
  }
  return User
}
