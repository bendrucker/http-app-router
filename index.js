'use strict'

const HashRouter = require('http-hash-router')
const partial = require('ap').partial
const TypedError = require('error/typed')
const pick = require('object-pick')
const validate = require('./validate')
const fetch = require('./fetch')
const Transform = require('./transform')
const cookie = require('./cookie')

module.exports = AppRouter

const MethodNotAllowed = TypedError({
  type: 'http-app-router.method-not-allowed',
  statusCode: 405,
  message: 'Method not allowed: {method} {url}',
  method: null,
  url: null
})

function AppRouter (apps) {
  var _default = null
  const router = HashRouter()

  validate(apps)
  apps.forEach(createRoutes)

  return function (req, res, callback) {
    if (req.method !== 'GET') {
      return callback(MethodNotAllowed({
        method: req.method,
        url: req.url
      }))
    }

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

function sendApp (app, req, res, options, callback) {
  if (!callback) callback = options
  fetch(app, pick(req, ['headers', 'url']), function (err, html) {
    if (err) return callback(err)
    res.statusCode = html.statusCode

    const cookies = cookie.outbound(app.cookies, html.headers['set-cookie'])
    if (cookies) res.setHeader('Set-Cookie', cookies)

    html
      .pipe(Transform(app))
      .pipe(res)
  })
}
