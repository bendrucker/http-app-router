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

  const handler = Handler(router, (err) => err && t.end(err))

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

test('not found error callback', function (t) {
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

  const handler = Handler(router, (err) => err && t.end(err))

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

test('HEAD requests are allowed', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*'
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://github.com')
    .head('/bendrucker')
    .reply(200)

  inject(handler, {method: 'head', url: '/bendrucker'}, function (res) {
    t.equal(res.statusCode, 200)
  })
})

test('redirect', function (t) {
  t.plan(2)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*'
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://github.com')
    .get('/bendrucker')
    .reply(302, '', {
      Location: '/foo'
    })

  inject(handler, {url: '/bendrucker'}, function (res) {
    t.equal(res.statusCode, 302)
    t.equal(res.headers.location, '/foo')
  })
})

test('insecure', function (t) {
  t.plan(2)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*',
      insecure: true
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('http://github.com')
    .get('/bendrucker')
    .reply(302, '', {
      Location: '/foo'
    })

  inject(handler, {url: '/bendrucker'}, function (res) {
    t.equal(res.statusCode, 302)
    t.equal(res.headers.location, '/foo')
  })
})

test('splats', function (t) {
  t.plan(1)

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
        '/iphone/*'
      ],
      headers: {
        'secret-free-iphones': true
      }
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://apple.com', {
    reqheaders: {
      'secret-free-iphones': 'true'
    }
  })
  .get('/iphone/free')
  .reply(200, 'secret')

  inject(handler, {method: 'get', url: '/iphone/free'}, function (res) {
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

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://github.com')
    .get('/bendrucker')
    .reply(200, '<script src="app.js"></script>')

  inject(handler, {method: 'get', url: '/bendrucker'}, function (res) {
    t.equal(res.payload, '<script src="https://github.com/app.js"></script>')
  })

  t.on('end', nock.cleanAll)
})

test('cookies', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*',
      cookies: [
        'beep'
      ]
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://github.com', {
    reqheaders: {
      cookie: 'beep=boop'
    }
  })
  .get('/bendrucker')
  .reply(200, 'nom nom cookies', {
    'Set-Cookie': 'beep=boop'
  })

  inject(handler, {method: 'get', url: '/bendrucker', headers: {cookie: 'beep=boop'}}, function (res) {
    t.deepEqual(res.headers['set-cookie'], ['beep=boop'])
  })

  t.on('end', nock.cleanAll)
})

test('headers', function (t) {
  t.plan(2)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*',
      cookies: [
        'beep'
      ]
    }
  ])

  const handler = Handler(router, (err) => err && t.end(err))

  nock('https://github.com')
    .get('/bendrucker')
    .reply(200, JSON.stringify({foo: 'bar'}), {
      'Content-Type': 'application/json',
      'Arbitrary-Key': 'stripped'
    })

  inject(handler, {method: 'get', url: '/bendrucker'}, function (res) {
    t.equal(res.headers['content-type'], 'application/json', 'includes standard response headers')
    t.notOk(res.headers['arbitrary-key'], 'excludes unknown headers')
  })

  t.on('end', nock.cleanAll)
})

test('invalid method', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*'
    }
  ])

  const handler = Handler(router, function (err) {
    t.equal(err.statusCode, 405)
  })

  inject(handler, {method: 'post', url: '/bendrucker'}, t.fail.bind(t, 'unexpected response'))
})

test('app request error', function (t) {
  t.plan(1)

  const router = Router([
    {
      name: 'github',
      host: 'dns.will.cause.an.err',
      routes: '*',
      transforms: [
        'absolute'
      ]
    }
  ])

  const handler = Handler(router, function (err) {
    t.equal(err.code, 'ENOTFOUND')
  })

  inject(handler, {method: 'get', url: '/bendrucker'}, t.fail)
})

test('logs', function (t) {
  t.plan(9)

  const router = Router([
    {
      name: 'github',
      host: 'github.com',
      routes: '*'
    }
  ])

  nock('https://github.com')
    .get('/bendrucker')
    .reply(200)

  const logs = []
  router.onLog(logs.push.bind(logs))

  const handler = Handler(router, (err) => err && t.end(err))

  inject(handler, {method: 'get', url: '/bendrucker'}, function (res) {
    t.equal(logs.length, 3)
    t.deepEqual(logs[0], {level: 'debug', message: '/bendrucker -> default'}, 'logs default redirects')
    t.deepEqual(logs[1], {
      level: 'info',
      message: {
        name: 'github',
        message: 'request',
        url: '/bendrucker'
      }
    }, 'logs request')

    const response = logs[2].message
    t.equal(logs[2].level, 'info')
    t.equal(response.name, 'github')
    t.equal(response.message, 'response')
    t.equal(response.url, '/bendrucker')
    t.equal(response.statusCode, 200)
    t.equal(typeof response.elapsed, 'number')
  })
})

function Handler (router, onError) {
  return function (req, res) {
    router(req, res, onError)
  }
}
