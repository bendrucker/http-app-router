'use strict'

const HashRouter = require('http-hash-router')
const partial = require('ap').partial
const TypedError = require('error/typed')
const pick = require('object.pick')
const Event = require('geval/event')
const pump = require('pump')
const headers = require('standard-headers')
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
  const log = Event()

  validate(apps)
  apps.forEach(createRoutes)

  return Object.assign(appRouter, {
    onLog: log.listen
  })

  function appRouter (req, res, callback) {
    // Handle ourselves b/c http-hash-router will return 404 with a default
    // route route regardless of the method
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return callback(MethodNotAllowed({
        method: req.method,
        url: req.url
      }))
    }

    router(req, res, {}, function (err) {
      if (err && err.type === 'http-hash-router.not-found' && _default) {
        log.broadcast({
          level: 'debug',
          message: `${req.url} -> default`
        })
        return _default(req, res, callback)
      }

      callback(err)
    })
  }

  function createRoutes (app) {
    if (app.routes === '*') {
      log.broadcast({
        level: 'debug',
        message: `Registering "${app.name}" as default app`
      })
      _default = partial(sendApp, app)
      return
    }

    app.routes.forEach((route) => router.set(route, partial(sendApp, app)))
  }

  function sendApp (app, req, res, options, callback) {
    if (!callback) callback = options

    const start = Date.now()

    log.broadcast({
      level: 'info',
      message: {
        name: app.name,
        message: 'request',
        url: req.url
      }
    })

    fetch(app, pick(req, ['headers', 'url', 'method']), function (err, html) {
      if (err) return callback(err)

      log.broadcast({
        level: 'info',
        message: {
          name: app.name,
          message: 'response',
          url: req.url,
          statusCode: html.statusCode,
          elapsed: Date.now() - start
        }
      })

      res.statusCode = html.statusCode

      Object.keys(html.headers)
        .filter((key) => headers.response.indexOf(key) >= 0)
        .forEach((key) => res.setHeader(key, html.headers[key]))

      const cookies = cookie.outbound(app.cookies, html.headers['set-cookie'])
      if (cookies) res.setHeader('Set-Cookie', cookies)

      pump(html, Transform(app), res, callback)
    })
  }
}
