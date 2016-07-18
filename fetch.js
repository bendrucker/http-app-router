'use strict'

const assert = require('assert')
const timeout = require('timed-out')
const get = require('simple-get')
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
      cookie: cookie.inbound(app.cookies, data.headers.cookie)
    })),
    method: data.method
  }

  const req = get(options, callback)
  if (app.timeout) timeout(req, app.timeout)
}
