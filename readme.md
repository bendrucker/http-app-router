# http-app-router [![Build Status](https://travis-ci.org/bendrucker/http-app-router.svg?branch=master)](https://travis-ci.org/bendrucker/http-app-router) [![codecov](https://codecov.io/gh/bendrucker/http-app-router/branch/master/graph/badge.svg)](https://codecov.io/gh/bendrucker/http-app-router) [![Greenkeeper badge](https://badges.greenkeeper.io/bendrucker/http-app-router.svg)](https://greenkeeper.io/)

> Request router for building HTTP proxy servers

http-app-router is a Node HTTP router designed for serving multiple HTML applications on the same domain. HTML applications might include:

* A single page JavaScript web app
* A CMS-powered blog
* Static HTML content

If it speaks HTTP and sends HTML, it's an HTML app. Apps are defined with a server `host` and a list of `routes` that should match to that app. The router will make a request to your app and stream the response down to the client.


## Install

```
$ npm install --save http-app-router
```


## Usage

Pass an array of `apps` to the `Router` contructor to create a router handler. Use that handler to route requests and send a response if an app matches the request. Handlers are `req, res, callback` functions that you can use with plain `http.Server` instances or connect/express apps.

The router will *always* send a response when fetching the app is successful and will *never* send an error response. That's up to you.

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

Returns a `router` function.

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

###### insecure

Type: `boolean`  
Default: `false`

Toggles the app to be fetched over plain HTTP instead of HTTPS.

###### prefix

Type: `string`  
Default: `''`

A prefix that will be removed from the URL before being passed along.

###### headers

Type: `object`  

Optional headers to set on requests.

###### cookies

Type: `array[string]`

A whitelist of cookie names that can be sent by a client or set by an app.

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

#### `router.onLog(listener)` -> `function`

Listens on log output from the router.

##### listener

*Required*  
Type: `function`  
Arguments: `{level, message}`

## License

MIT © [Ben Drucker](http://bendrucker.me)
