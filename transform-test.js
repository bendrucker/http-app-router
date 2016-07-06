'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const PassThrough = require('readable-stream/passthrough')
const transformify = require('transformify')
const toStream = require('from2-string')
const concat = require('concat-stream')
const transforms = require('./transforms')

test('transform', function (t) {
  t.plan(2)

  // Pass a cloned transform object so we can add mocks
  const customTransforms = Object.assign({}, transforms, {
    noop: function (app) {
      t.ok(app, 'app is passed in')
      return PassThrough()
    },
    uppercase: function (app) {
      return transformify(upper)()
    }
  })

  const Transform = proxyquire('./transform', {
    './transforms': customTransforms
  })

  const transform = Transform({
    host: 'foo.bar',
    transforms: [
      'absolute',
      'noop',
      'uppercase'
    ]
  })

  toStream('<script src="app.js"></script>')
    .pipe(transform)
    .pipe(concat(function (html) {
      html = String(html)
      t.equal(html, '<SCRIPT SRC="HTTPS://FOO.BAR/APP.JS"></SCRIPT>')
    }))
})

function upper (string) {
  return string.toUpperCase()
}
