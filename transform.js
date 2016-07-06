'use strict'

const PassThrough = require('readable-stream').PassThrough
const pumpify = require('pumpify')
const transforms = require('./transforms')

module.exports = Transform

function Transform (app) {
  if (!app.transforms || !app.transforms.length) return new PassThrough()
  const transformStreams = app.transforms.map((t) => transforms[t](app))
  return app.transforms.length > 1
    ? pumpify.apply(null, transformStreams)
    : transformStreams[0]
}

