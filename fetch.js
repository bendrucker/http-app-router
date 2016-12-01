'use strict'

const assert = require('assert')
const url = require('url')
const http = require('http')
const https = require('https')
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
    method: data.method.toUpperCase()
  }

  parseUrl(options)

  const protocol = options.protocol === 'https:' ? https : http

  return protocol.request(options, function (res) {
    callback(null, res)
  })
  .on('error', callback)
  .end()
}

function parseUrl (data) {
  const location = url.parse(data.url)

  data.hostname = location.hostname
  data.protocol = location.protocol
  data.path = location.path

  delete data.url
}
