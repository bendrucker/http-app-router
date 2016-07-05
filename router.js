'use strict'

const assert = require('assert')
const HashRouter = require('http-hash-router')
const Validator = require('is-my-json-valid')
const get = require('simple-get')
const partial = require('ap').partial
const pumpify = require('pumpify')
const PassThrough = require('readable-stream/passthrough')
const transforms = require('./transforms')
const schema = require('./schema.json')

const validateApp = Validator(schema)

module.exports = AppRouter

function AppRouter (apps) {
  var _default = null
  const router = HashRouter()

  validate(apps)
  apps.forEach(createRoutes)

  return function (req, res, callback) {
    router(req, res, {}, function (err) {
      if (err.statusCode === 404) {
        return _default(req, res, callback)
      }

      callback(err)
    })
  }

  function createRoutes (app) {
    if (app.routes === '*') {
      _default = partial(AppStream, app)
      return
    }

    app.routes.forEach((route) => router.set(route, partial(AppStream, app)))
  }
}

function AppStream (app, req, res, opts, callback) {
  const options = {
    url: ['http:', '//', app.host, req.path].join(''),
    headers: app.headers
  }

  get(options, function (err, _res) {
    if (err) return callback(err)
    res.statusCode = _res.statusCode

    _res
      .pipe(AppTransform(app))
      .pipe(res)
  })
}

function AppTransform (app) {
  if (!app.transforms) return PassThrough()
  const transformFns = app.transforms.map((t) => transforms[t])
  if (app.transforms.length === 1) return transformFns[0](app)
  return pumpify.apply(null, transformFns)
}

function validate (apps) {
  const wilcards = apps.filter((app) => app.routes === '*')
  assert(wilcards.length <= 1, 'multiple wildcard apps are not allowed')

  apps.forEach(function (app) {
    const valid = validateApp(app)
    const errors = validateApp.errors || [{}]
    assert(valid, `"${app.name}" is invalid: ${errors[0].field} ${errors[0].message}`)
  })

  apps
    .reduce((acc, app) => acc.concat(app.transforms || []), [])
    .forEach((t) => assert(transforms[t], `invalid transform: ${t}`))
}

