'use strict'

const HashRouter = require('http-hash-router')
const partial = require('ap').partial
const validate = require('./validate')
const fetch = require('./fetch')
const Transform = require('./transform')

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
      _default = partial(sendApp, app)
      return
    }

    app.routes.forEach((route) => router.set(route, partial(sendApp, app)))
  }
}

function sendApp (app, req, res, callback) {
  fetch(app, req.url, function (err, html) {
    if (err) return callback(err)
    res.statusCode = html.statusCode

    html
      .pipe(Transform(app))
      .pipe(res)
  })
}
