require('dotenv').config()

const _ = require('lodash')
const db = require('models')
const Boom = require('boom')
const moment = require('moment')
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const config = require('config')('config.json')
const { check } = require('express-validator/check')

const app = express()
// Probe every 5th second.
app.param(['id', 'user_id'], function (req, res, next, value) { next() })
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const endUser = '/user'

app.post(`${endUser}/create`, [
  check('name').isLength({ min: 10 }),
  check('email').isEmail(),
  check('username').isLength({ min: 7 }),
  check('password').isLength({ min: 7 })
], async function (req, res) {
  if (await db.User.findOne({ where: { username: req.body.username } })) res.send(Boom.conflict('username_in_use').output.payload)
  if (await db.User.findOne({ where: { email: req.body.email } })) res.send(Boom.conflict('email_in_use').output.payload)
  const user = await db.User.create(req.body)
  res.send(user)
})

app.post(`${endUser}/delete`, [
  check('username'),
  check('password')
], async function (req, res) {
  try {
    const decoded = await verifyToken(req.headers.authorization)
    const user = await db.User.findOne({ where: { username: decoded.username } })
    if (!user || !user.verifyPassword(req.body.password)) {
      res.send(Boom.unauthorized('invalid_username_or_password').output.payload)
    }
    await user.destroy()
    res.send(`${user.username}_deleted`)
  } catch (err) {
    res.send(err)
  }
})

app.post(`${endUser}/show`, async function (req, res) {
  const decoded = await verifyToken(req.headers.authorization)
  const user = await db.User.findByPk(decoded.id)
  res.send(user)
})

app.post('/update', [
  check('name').isLength({ min: 10 }),
  check('email').isEmail(),
  check('username').isLength({ min: 7 }),
  check('password').isLength({ min: 7 })
], async function (req, res) {
  if (await db.User.findOne({ where: { username: req.body.username } })) res.send(Boom.conflict('username_in_use').output.payload)
  if (await db.User.findOne({ where: { email: req.body.email } })) res.send(Boom.conflict('email_in_use').output.payload)
  const user = await db.User.create(req.body)
  res.send(user)
})

app.post('/login', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const user = await db.User.findOne({ where: { username: username } })
  if (!user) res.send(Boom.notFound('user_not_found').output.payload)
  if (!user.validPassword(password)) res.send(Boom.forbidden('invalid_password').output.payload)
  const token = user.generateToken(user)
  res.status(200).send({
    user: user.username,
    token: token
  })
})

app.listen(3888, function () {
  console.log('Server initialized')
})

const verifyToken = async function (token) {
  if (!token) throw Boom.forbidden('no_token')
  const decoded = jwt.verify(token, config.JWT_SECRET_KEY)
  if (typeof decoded !== 'object') throw Boom.forbidden('invalid_token')
  if (_.has(decoded, ['username', 'id', 'exp'])) throw Boom.forbidden('invalid_token')
  if (moment.unix() - decoded.exp > 0) throw Boom.unauthorized('token_expired')
  if (!await db.User.findByPk(decoded.id)) throw Boom.notFound('user_deleted')
  return decoded
}
