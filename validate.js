'use strict'

const assert = require('assert')
const Validator = require('is-my-json-valid')
const transforms = require('./transforms')
const schema = require('./schema.json')

const schemaValidator = Validator(schema)

module.exports = validate

function validate (apps) {
  const wilcards = apps.filter((app) => app.routes === '*')
  assert(wilcards.length <= 1, 'multiple wildcard apps are not allowed')

  apps.forEach(function (app) {
    const valid = schemaValidator(app)
    const errors = schemaValidator.errors || [{}]
    assert(valid, `"${app.name}" is invalid: ${errors[0].field} ${errors[0].message}`)
  })

  apps
    .reduce((acc, app) => acc.concat(app.transforms || []), [])
    .forEach((t) => assert(transforms[t], `invalid transform: ${t}`))
}
