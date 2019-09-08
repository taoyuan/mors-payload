mors-payload
============
[![NPM Version](https://img.shields.io/npm/v/mors-payload.svg?style=flat)](https://www.npmjs.org/package/mors-payload)
[![Build Status](http://img.shields.io/travis/taoyuan/mors-payload.svg?style=flat)](https://travis-ci.org/taoyuan/mors-payload)
[![Dependencies](https://img.shields.io/david/taoyuan/mors-payload.svg?style=flat)](https://david-dm.org/taoyuan/mors-payload) [![Greenkeeper badge](https://badges.greenkeeper.io/taoyuan/mors-payload.svg)](https://greenkeeper.io/)

> Mors payload parsing middleware

## Installation

```bash
$ npm install mors-payload
```

## API

```js
var mors = require('mors')
var payload = require('mors-payload')

var app = mors()

// parse json
app.use(payload.json())

app.use(function (req, res, next) {
  console.log(req.body) // populated!
  next()
});
```

## License

Copyright (c) 2014 Tao Yuan  
Licensed under the MIT license.
