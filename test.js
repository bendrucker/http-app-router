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
        'iphone'
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

function Handler (router, onError) {
  return function (req, res) {
    router(req, res, onError)
  }
}
