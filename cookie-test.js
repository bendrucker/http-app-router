'use strict'

const test = require('tape')
const cookie = require('./cookie')

test('cookie: inbound', function (t) {
  t.equal(cookie.inbound(['beep'], 'beep=boop; foo=bar'), 'beep=boop', 'strips using whitelist')
  t.equal(cookie.inbound(['beep'], 'foo=bar'), undefined, 'returns undefined if none allowed')
  t.end()
})

test('cookie: outbound', function (t) {
  t.deepEqual(
    cookie.outbound(
      ['beep'],
      ['beep=boop', 'foo=bar']
    ),
    ['beep=boop'],
    'strips using whitelist'
  )
  t.deepEqual(
    cookie.outbound(
      ['beep'],
      ['beep=boop; max-age=1', 'foo=bar']
    ),
    ['beep=boop; Max-Age=1'],
    'preserves options'
  )
  t.end()
})
