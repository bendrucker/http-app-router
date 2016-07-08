'use strict'

const assert = require('assert')
const transforms = require('./transforms')
const schema = require('./schemas')

module.exports = validate

function validate (apps) {
  const valid = schema({apps: apps})
  if (!valid) throw new Error(schema.errors[0].message)

  const wilcards = apps.filter((app) => app.routes === '*')
  assert(wilcards.length <= 1, 'multiple wildcard apps are not allowed')

  apps
    .reduce((acc, app) => acc.concat(app.transforms || []), [])
    .forEach((t) => assert(transforms[t], `invalid transform: ${t}`))
}
