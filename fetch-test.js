'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const Req = require('mock-req')

test('fetch', function (t) {
  t.plan(6)

  const fetch = proxyquire('./fetch', {
    'simple-get': function (options, callback) {
      t.deepEqual(options, {
        url: 'https://host.co/path?page=2',
        headers: {
          foo: 'bar',
          'accept-encoding': 'identity'
        },
        method: 'GET'
      })
      callback()
      const req = new Req()
      req.setTimeout = (time) => t.equal(time, 10)
      req.abort = () => t.pass('abooooort')
      return req
    }
  })

  t.throws(fetch, /app is required/)
  t.throws(fetch.bind(null, {}, {}), /url is required/)
  fetch({
    host: 'host.co',
    headers: {foo: 'bar'},
    cookies: [],
    timeout: 10
  }, {
    url: '/path?page=2',
    headers: {cookie: ''},
    method: 'GET'
  }, t.pass)
})

test('fetch - insecure', function (t) {
  t.plan(6)

  const fetch = proxyquire('./fetch', {
    'simple-get': function (options, callback) {
      t.deepEqual(options, {
        url: 'http://host.co/path?page=2',
        headers: {
          foo: 'bar',
          'accept-encoding': 'identity'
        },
        method: 'GET'
      })
      callback()
      const req = new Req()
      req.setTimeout = (time) => t.equal(time, 10)
      req.abort = () => t.pass('abooooort')
      return req
    }
  })

  t.throws(fetch, /app is required/)
  t.throws(fetch.bind(null, {}, {}), /url is required/)
  fetch({
    host: 'host.co',
    headers: {foo: 'bar'},
    cookies: [],
    insecure: true,
    timeout: 10
  }, {
    url: '/path?page=2',
    headers: {cookie: ''},
    method: 'GET'
  }, t.pass)
})
