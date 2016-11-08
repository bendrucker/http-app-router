'use strict'

const Ajv = require('ajv')
const ajv = new Ajv({useDefaults: true, unknownFormats: true})

const router = require('./router.json')
const app = require('./app.json')

ajv.addSchema(app)

module.exports = ajv.compile(router)
