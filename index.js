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
app.param(['id', 'user_id', 'username'], function (req, res, next, value) { next() })
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const endUser = '/user'
const endWorld = '/world'
const endVisitor = '/visitor'

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

app.post(`${endWorld}/create`, [
  check('sky').isLength({ min: 7 }),
  check('ground').isLength({ min: 7 }),
  check('plate').isLength({ min: 7 })
], async function (req, res) {
  try {
    const decoded = await verifyToken(req.headers.authorization)
    if (await db.World.findByPk(decoded.id)) res.send(Boom.conflict('user_has_world').output.payload)
    const world = await db.World.create(Object.assign({}, req.body, { unique_visitors: 0 }))
    res.send(world)
  } catch (err) {
    res.send(err)
  }
})

app.post(`${endWorld}/delete`, [
  check('username'),
  check('password')
], async function (req, res) {
  try {
    const decoded = await verifyToken(req.headers.authorization)
    const user = await db.User.findOne({ where: { username: decoded.username } })
    if (!user || !user.verifyPassword(req.body.password)) {
      res.send(Boom.unauthorized('invalid_username_or_password').output.payload)
    }
    const world = await db.World.findByPk(decoded.id)
    await world.destroy()
    res.send(`${user.username}_deleted_his_world`)
  } catch (err) {
    res.send(err)
  }
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

app.post(`${endVisitor}/:username`, async function (req, res) {
  try {
    const decoded = await verifyToken(req.headers.authorization)
    const user = await db.User.findOne({ where: { username: req.params.username } })
    const world = await db.World.findOne({ where: { user_id: user.id } })
    const visit = await db.Visitor.findOne({ where: { world_id: req.params.world_id } })
    if (!visit) {
      await db.Visitor.create({ where: { user_id: decoded.id, world_id: req.params.world_id, last_login_at: moment().format() } })
      await world.update({ unique_visitors: world.unique_visitors + 1 })
    } else {
      visit.update({ last_login_at: moment().format() })
    }
    res.send(world)
  } catch (err) {
    res.send(err)
  }
})

app.get(`${endVisitor}`, async function (req, res) {
  try {
    await verifyToken(req.headers.authorization)
    const world = await db.World.findAll()
    res.send(world)
  } catch (err) {
    res.send(err)
  }
})

app.get(`${endUser}/show`, async function (req, res) {
  const decoded = await verifyToken(req.headers.authorization)
  const world = await db.World.findOne({ where: { user_id: decoded.id } })
  res.send(world)
})

app.get(`${endUser}/show`, async function (req, res) {
  const decoded = await verifyToken(req.headers.authorization)
  const world = await db.World.findOne({ where: { user_id: decoded.id } })
  res.send(world)
})

app.post(`${endWorld}/update/:world_id`, [
  check('sky').isLength({ min: 7 }),
  check('ground').isLength({ min: 7 }),
  check('plate').isLength({ min: 7 })
], async function (req, res) {
  const world = await db.World.findByPk(req.params.world_id)
  if (!world) res.send(Boom.notFound('world_not_found').output.payload)
  const decoded = await verifyToken(req.headers.authorization)
  const user = await db.User.findOne({ where: { username: decoded.username } })
  if (!user || !user.verifyPassword(req.body.password)) {
    res.send(Boom.unauthorized('invalid_username_or_password').output.payload)
  }
  const newWorld = await world.update(req.body)
  res.send(newWorld)
})

app.post(`${endUser}/update`, [
  check('name').isLength({ min: 10 }),
  check('email').isEmail(),
  check('username').isLength({ min: 7 }),
  check('password').isLength({ min: 7 })
], async function (req, res) {
  try {
    const decoded = await verifyToken(req.headers.authorization)
    if (req.body.username) if (await db.User.findOne({ where: { username: req.body.username, [db.sequelize.Op.not]: [{ id: decoded.id }] } })) res.send(Boom.conflict('username_in_use').output.payload)
    if (req.body.email) if (await db.User.findOne({ where: { email: req.body.email, [db.sequelize.Op.not]: [{ id: decoded.id }] } })) res.send(Boom.conflict('email_in_use').output.payload)

    let user = await db.User.findByPk(decoded.id)
    await user.update(req.body)
    user = await db.User.findByPk(decoded.id)
    res.send(user)
  } catch (err) {
    res.send(err)
  }
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
