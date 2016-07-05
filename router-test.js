'use strict'

const test = require('tape')
const Router = require('./router')

test('router', function (t) {
  t.test('schema validation', function (t) {
    t.throws(Router.bind(null, [
      {}
    ]), /name is required/, 'requires name')

    t.throws(Router.bind(null, [
      {
        name: 'foo'
      }
    ]), /routes is required/, 'requires routes')

    t.throws(Router.bind(null, [
      {
        name: 'foo',
        routes: '*'
      }
    ]), /host is required/, 'requires host')

    t.end()
  })

  t.test('transform validation', function (t) {
    t.throws(Router.bind(null, [
      {
        name: 'foo',
        routes: '*',
        host: '',
        transforms: ['bad']
      }
    ]), /invalid transform: bad/, 'validates transforms')
    t.end()
  })

  t.test('route validation', function (t) {
    t.throws(Router.bind(null, [
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
