var async = require('async')
  , crypto = require('crypto')
  , ff = require('ff')
  , fs = require('fs')

module.exports.build = function (base, minify, next) {
  var assets = require(base + '/assets.json')
    , manifest = {
          css: {}
        , js: {}
        , all: {}
      }
  
  async.eachSeries(Object.keys(assets), function (group, next) {
    async.eachSeries(assets[group], function (file, next) {
      var proc = require('./types/' + file.match(/(.+)\.(.+)/)[2])
      
      var f = ff(function () {
        fs.readFile(base + '/' + file, 'utf8', f.slot())
      }, function (data) {
        proc.render(file, data, f.slot())
      }, function (data) {
        if (minify)
          proc.minify(file, data, f.slot())
        else
          f.pass(data)
      }, function (data) {
        manifest[proc.type][group] = (manifest[proc.type][group] || '') + data
      }).onComplete(next)
    }, function (err) {
      if (err) return next(err)
      
      var f = ff(function () {
        var css = manifest.css[group]
          , js = manifest.js[group]
        
        if (css) {
          var csssum = crypto.createHash('md5').update(css).digest('hex')
          manifest.css[group] = '<link rel="stylesheet" href="/parcel/' + csssum + '-' + group + '.css">';
          manifest.all[group + '.css'] = csssum
          fs.writeFile(base + '/public/parcel/' + csssum + '-' + group + '.css', css, f.slot())
        }
        
        if (js) {
          var jssum = crypto.createHash('md5').update(js).digest('hex')
          manifest.js[group] = '<script src="/parcel/' + csssum + '-' + group + '.js"></script>';
          manifest.all[group + '.js'] = jssum
          fs.writeFile(base + '/public/parcel/' + jssum + '-' + group + '.js', js, f.slot())
        }
      }).onComplete(next)
    })
  }, function (err) {
    if (err) return next(err)
    
    fs.writeFile(base + '/public/parcel/manifest.json', JSON.stringify(manifest), next)
  })
}

module.exports.clean = function (base, next) {
  var groups = require(base + '/public/parcel/manifest.json').all
  
  var f = ff(function () {
    fs.readdir(base, f.slot())
  }, function (files) {
    files.forEach(function (file) {
      var key = file.split('-')
      
      if (key[0] !== 'manifest.json' && key[0] !== groups[key[1]])
        fs.unlink(base + '/' + file, f.slot())
    })
  }).onComplete(next)
}