'use strict'

const assert = require('assert')
const get = require('simple-get')

module.exports = fetch

function fetch (app, data, callback) {
  assert(data.path, 'path is required')

  const options = {
    url: ['http:', '//', app.host, data.path].join(''),
    headers: app.headers
  }

  get(options, callback)
}
