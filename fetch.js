'use strict'

const assert = require('assert')
const got = require('got')
const extend = require('xtend')
const filter = require('boolean-filter-obj')
const cookie = require('./cookie')

module.exports = fetch

function fetch (app, data, callback) {
  assert(app, 'app is required')
  assert(data, 'data is required')
  assert.equal(typeof data.url, 'string', 'data.url is required')

  const options = {
    url: ['http', app.insecure ? '' : 's', '://', app.host, data.url].join(''),
    headers: filter(extend(app.headers, {
      'accept-encoding': 'identity',
      cookie: cookie.inbound(app.cookies, data.headers.cookie)
    })),
    method: data.method,
    timeout: app.timeout,
    followRedirect: false
  }

  got.stream(options.url, options)
    .on('response', function (res) {
      callback(null, res)
    })
    .on('error', function (err, body, res) {
      if (err.statusCode && err.statusCode < 400) {
        return callback(null, res)
      }

      callback(err)
    })
}
