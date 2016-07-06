'use strict'

const test = require('tape')
const inject = require('shot').inject
const nock = require('nock')
const Router = require('./')

test('http-app-router', function (t) {
  t.plan(2)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: [
        '/bendrucker'
      ]
    },
    {
      name: 'apple',
      host: 'apple.com',
      routes: [
        '/iphone'
      ],
      headers: {
        'secret-free-iphones': true
      }
    }
  ])

  const handler = Handler(router, t.end)

  nock('https://github.com')
    .get('/bendrucker')
    .reply(200, 'modules?')

  nock('https://apple.com', {
    reqheaders: {
      'secret-free-iphones': 'true'
    }
  })
  .get('/iphone')
  .reply(200, 'secret')

  inject(handler, {method: 'get', url: '/bendrucker'}, function (res) {
    t.equal(res.payload, 'modules?')
  })

  inject(handler, {method: 'get', url: '/iphone'}, function (res) {
    t.equal(res.payload, 'secret')
  })

  t.on('end', nock.cleanAll)
})

test('error callback', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: [
        '/bendrucker'
      ]
    },
    {
      name: 'apple',
      host: 'apple.com',
      routes: [
        '/iphone'
      ],
      headers: {
        'secret-free-iphones': true
      }
    }
  ])

  const handler = Handler(router, (err) => t.equal(err.statusCode, 404))

  inject(handler, {method: 'get', url: '/'}, t.fail)
})

test('default route', function (t) {
  t.plan(2)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*'
    },
    {
      name: 'apple',
      host: 'apple.com',
      routes: [
        '/iphone'
      ],
      headers: {
        'secret-free-iphones': true
      }
    }
  ])

  const handler = Handler(router, t.end)

  nock('https://github.com')
    .get('/anyone-you-want')
    .reply(200, 'more modules?')

  nock('https://apple.com', {
    reqheaders: {
      'secret-free-iphones': 'true'
    }
  })
  .get('/iphone')
  .reply(200, 'secret')

  inject(handler, {method: 'get', url: '/anyone-you-want'}, function (res) {
    t.equal(res.payload, 'more modules?')
  })

  inject(handler, {method: 'get', url: '/iphone'}, function (res) {
    t.equal(res.payload, 'secret')
  })

  t.on('end', nock.cleanAll)
})

test('transforms', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*',
      transforms: [
        'absolute'
      ]
    }
  ])

  const handler = Handler(router, t.end)

  nock('https://github.com')
    .get('/bendrucker')
    .reply(200, '<script src="app.js"></script>')

  inject(handler, {method: 'get', url: '/bendrucker'}, function (res) {
    t.equal(res.payload, '<script src="https://github.com/app.js"></script>')
  })

  t.on('end', nock.cleanAll)
})

function Handler (router, onError) {
  return function (req, res) {
    router(req, res, onError)
  }
}
