'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const PassThrough = require('stream').PassThrough
const transformify = require('transformify')
const toStream = require('from2-string')
const concat = require('concat-stream')
const transforms = require('./transforms')

test('transform', function (t) {
  t.plan(4)

  // Pass a cloned transform object so we can add mocks
  const customTransforms = Object.assign({}, transforms, {
    noop: function (app) {
      t.ok(app, 'app is passed in')
      return new PassThrough()
    },
    uppercase: function (app) {
      return transformify(upper)()
    }
  })

  const Transform = proxyquire('./transform', {
    './transforms': customTransforms
  })

  const none = Transform({
    host: 'none',
    transforms: []
  })

  const one = Transform({
    host: 'one',
    transforms: [
      'uppercase'
    ]
  })

  const many = Transform({
    host: 'foo.bar',
    transforms: [
      'absolute',
      'noop',
      'uppercase'
    ]
  })

  toStream('hi')
    .pipe(none)
    .pipe(concat(function (html) {
      t.equal(String(html), 'hi')
    }))

  toStream('hi')
    .pipe(one)
    .pipe(concat(function (html) {
      t.equal(String(html), 'HI')
    }))

  toStream('<script src="app.js"></script>')
    .pipe(many)
    .pipe(concat(function (html) {
      t.equal(String(html), '<SCRIPT SRC="HTTPS://FOO.BAR/APP.JS"></SCRIPT>')
    }))
})

function upper (string) {
  return string.toUpperCase()
}
