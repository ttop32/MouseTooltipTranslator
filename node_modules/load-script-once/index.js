'use strict'

var loadScript = require('load-script')
var cache = {}

module.exports = function loadScriptOnce (src, callback) {
  var promise = cache[src]
  if (!promise) {
    promise = cache[src] = doLoad(src)

    // On error, fail to allow retry
    promise.catch(function () {
      delete cache[src]
    })
  }

  if (callback) {
    promise.then(callback, callback)
  }

  return promise
}

function doLoad (src) {
  return new Promise(function (resolve, reject) {
    loadScript(src, function (error) {
      if (error) return reject(error)
      else resolve()
    })
  })
}
