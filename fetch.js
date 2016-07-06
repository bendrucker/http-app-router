'use strict'

const assert = require('assert')
const get = require('simple-get')

module.exports = fetch

function fetch (app, path, callback) {
  assert(app, 'app is required')
  assert(path, 'path is required')

  const options = {
    url: ['https:', '//', app.host, path].join(''),
    headers: app.headers
  }

  get(options, callback)
}
