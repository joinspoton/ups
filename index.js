var async = require('async')
  , crypto = require('crypto')
  , ff = require('ff')
  , fs = require('fs')
  , path = require('path')

module.exports.build = function (config, minify, next) {
  var assets = require(config)
    , manifest = {
          css: {}
        , js: {}
        , all: {}
      }
  
  config = path.dirname(config)
  config = {
      src: path.join(config, assets._src)
    , out: path.join(config, assets._out)
    , web: assets._web
  }
  
  async.eachSeries(Object.keys(assets), function (group, next) {
    if (!Array.isArray(assets[group])) return setImmediate(next)
    
    async.eachSeries(assets[group], function (file, next) {
      var proc = require('./types/' + path.extname(file).slice(1))
      
      var f = ff(function () {
        fs.readFile(path.join(config.src, file), 'utf8', f.slot())
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
          manifest.css[group] = '<link rel="stylesheet" href="' + config.web + '/' + csssum + '-' + group + '.css">';
          manifest.all[group + '.css'] = csssum
          fs.writeFile(path.join(config.out, csssum + '-' + group + '.css'), css, f.slot())
        }
        
        if (js) {
          var jssum = crypto.createHash('md5').update(js).digest('hex')
          manifest.js[group] = '<script src="' + config.web + '/' + jssum + '-' + group + '.js"></script>';
          manifest.all[group + '.js'] = jssum
          fs.writeFile(path.join(config.out, jssum + '-' + group + '.js'), js, f.slot())
        }
      }).onComplete(next)
    })
  }, function (err) {
    if (err) return next(err)
    
    fs.writeFile(path.join(config.out, 'manifest.json'), JSON.stringify(manifest), next)
  })
}

module.exports.clean = function (config, next) {
  var out = path.join(path.dirname(config), require(config)._out)
    , all = require(path.join(out, 'manifest.json')).all
  
  var f = ff(function () {
    fs.readdir(out, f.slot())
  }, function (files) {
    files.forEach(function (file) {
      var key = file.split('-')
      
      if (key[0] !== 'manifest.json' && key[0] !== all[key[1]])
        fs.unlink(path.join(out, file), f.slot())
    })
  }).onComplete(next)
}