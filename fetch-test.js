'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')

test('fetch', function (t) {
  t.plan(3)

  const fetch = proxyquire('./fetch', {
    'simple-get': function (options, callback) {
      t.deepEqual(options, {
        url: 'https://host.co/path?page=2',
        headers: {
          foo: 'bar'
        }
      })
    }
  })

  t.throws(fetch, /app is required/)
  t.throws(fetch.bind(null, {}), /path is required/)
  fetch({host: 'host.co', headers: {foo: 'bar'}}, '/path?page=2', function noop () {})
})
