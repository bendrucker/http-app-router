# http-app-router [![Build Status](https://travis-ci.org/bendrucker/tape-istanbul.svg?branch=master)](https://travis-ci.org/bendrucker/tape-istanbul) [![codecov](https://codecov.io/gh/bendrucker/http-app-router/branch/master/graph/badge.svg)](https://codecov.io/gh/bendrucker/http-app-router)

> Request router for building HTTP proxy servers


## Install

```
$ npm install --save http-app-router
```


## Usage

Pass an array of `apps` to the `Router` contructor to create a router handler. Use that handler to route requests and send a response if an app matches the request. Handlers are `req, res, callback` functions that you can use with plain `http.Server` instances or connect/express apps.

The router is *greedy*. Any request it receives will either generate a response or an error (never both). The `callback` function is only called to handle errors.

```js
var Router = require('http-app-router')
var http = require('http')

var router = Router([
  {
    name: 'github',
    host: 'github.com',
    routes: [
      '/bendrucker'
    ]
  },
  {
    name: 'local',
    host: 'localhost',
    routes: '*'
  }
])

var server = http.createServer(function (req, res) {
  router(req, res, function (err) {
    if (err) res.end('oh no, an error!')
  })
})
```

## API

#### `Router(apps)` -> `function`

##### app

*Required*  
Type: `array[object]`

An array of app objects, containing:

###### name

*Required*  
Type: `string`  

An application name.

###### host

*Required*  
Type: `string`  

The application host.

###### headers

Type: `object`  

Optional headers to set on requests.

###### transforms

Type: `array[string]`

An array of [`transform`](transforms.js) function keys that receive the `app` as an argument and return a [`Transform` stream](https://nodejs.org/api/stream.html#stream_class_stream_transform). The transform stream will receive and output HTML. 

Built in:

* [absolute](github.com/bendrucker/absoluteify)

Or add custom things, maybe minification or something equally practical:

```js
var transforms = require('http-app-router/transforms')
var through = require('through2')

tranforms.uppercase = function (app) {
  return through(function (chunk, enc, callback) {
    callback(null, chunk.toString().toUpperCase())
  })
}
```


## License

MIT © [Ben Drucker](http://bendrucker.me)
