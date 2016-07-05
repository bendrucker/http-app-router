'use strict'

const absoluteify = require('absoluteify')

// transform
// {(app) => TransformStream}

module.exports = {
  absolute: (app) => absoluteify('https://' + app.host)
}
