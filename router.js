'use strict'

const HashRouter = require('http-hash-router')
const get = require('simple-get')
const partial = require('ap').partial
const pumpify = require('pumpify')
const PassThrough = require('readable-stream/passthrough')
const validate = require('./validate')
const transforms = require('./transforms')

module.exports = AppRouter

function AppRouter (apps) {
  var _default = null
  const router = HashRouter()

  validate(apps)
  apps.forEach(createRoutes)

  return function (req, res, callback) {
    router(req, res, {}, function (err) {
      if (err.type === 'http-hash-router.not-found' && _default) {
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

