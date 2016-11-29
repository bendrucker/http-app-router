'use strict'

const test = require('tape')
const validate = require('./validate')

test('validate', function (t) {
  t.test('schema', function (t) {
    t.throws(validate.bind(null, [
      {}
    ]), /should have required property 'name'/, 'requires name')

    t.throws(validate.bind(null, [
      {
        name: 'foo'
      }
    ]), /should have required property 'routes'/, 'requires routes')

    t.throws(validate.bind(null, [
      {
        name: 'foo',
        routes: '*'
      }
    ]), /should have required property 'host'/, 'requires host')

    t.end()
  })

  t.test('transform', function (t) {
    t.throws(validate.bind(null, [
      {
        name: 'foo',
        routes: '*',
        host: 'foo',
        transforms: ['bad']
      }
    ]), /invalid transform: bad/, 'validates transforms')
    t.end()
  })

  t.test('route', function (t) {
    t.throws(validate.bind(null, [
      {
        name: 'foo',
        routes: '*',
        host: 'foo'
      },
      {
        name: 'bar',
        routes: '*',
        host: 'bar'
      }
    ]), /multiple wildcard apps/, 'prevents multiple wildcard routes')
    t.end()
  })
})
