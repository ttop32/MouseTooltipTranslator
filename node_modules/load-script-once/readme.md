# load-script-once [![Build Status](https://travis-ci.org/ajoslin/load-script-once.svg?branch=master)](https://travis-ci.org/ajoslin/load-script-once)

> load a script, but only once

## Install

```
$ npm install --save load-script-once
```


## Usage

```js
var loadScriptOnce = require('load-script-once')

loadScriptOnce('http://site.com/script.js')
  .then(() => /* success! */)
  .catch(err => console.error('failed to load!', err)
```

## API

If the script fails to load (with an error), the next call will try again.

If multiple calls happen for one script src while a request for that src is already in-flight, those multiple calls will wait for the result of the in-flight request.

Once the response to that request arrives, all of the loadScript calls that were waiting will receive the response from that one request.

If the request failed, the next loadScriptOnce call will try to fetch the script again.

Once a request for a script is successful, future loadScriptOnce calls for that src will effectively be a noop.

#### `var promise = loadScriptOnce(src)`

##### src

*Required*
Type: `string`

The script src to load

## License

MIT © [Andrew Joslin](http://ajoslin.com)
