'use strict'

const test = require('tape')
const validate = require('./validate')

test('validate', function (t) {
  t.test('schema', function (t) {
    t.throws(validate.bind(null, [
      {}
    ]), /name is required/, 'requires name')

    t.throws(validate.bind(null, [
      {
        name: 'foo'
      }
    ]), /routes is required/, 'requires routes')

    t.throws(validate.bind(null, [
      {
        name: 'foo',
        routes: '*'
      }
    ]), /host is required/, 'requires host')

    t.end()
  })

  t.test('transform', function (t) {
    t.throws(validate.bind(null, [
      {
        name: 'foo',
        routes: '*',
        host: '',
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
        host: ''
      },
      {
        name: 'bar',
        routes: '*',
        host: ''
      }
    ]), /multiple wildcard apps/, 'prevents multiple wildcard routes')
    t.end()
  })
})
