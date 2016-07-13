'use strict'

const cookie = require('cookie')
const parseSet = require('set-cookie-parser')
const partial = require('ap').partial

module.exports = {
  inbound: inbound,
  outbound: outbound
}

// inbound(['beep'], 'beep=boop; foo=bar'})
// => ['beep=boop']
function inbound (whitelist, value) {
  if (!value) return
  const data = cookie.parse(value)

  return whitelist
    .filter((key) => data[key])
    .map((key) => cookie.serialize(key, data[key]))
    .join('; ') || undefined
}

// outbound(['beep'], ['beep=boop; maxAge=1', 'foo=bar']})
// => ['beep=boop; max-age=1']
function outbound (whitelist, values) {
  if (!values) return
  const data = parseSet(values)

  return whitelist
    .filter(partial(findCookie, data))
    .map(partial(serializeSet, data))
}

function findCookie (list, key) {
  return list.find((cookie) => cookie.name === key)
}

function serializeSet (list, key) {
  const data = findCookie(list, key)
  return cookie.serialize(key, data.value, data)
}
