var async = require('async');
var crypto = require('crypto');
var ff = require('ff');
var fs = require('fs');
var path = require('path');

module.exports.types = {
    css: require('./types/css')
  , js: require('./types/js')
};

module.exports.build = function (config, minify, next, type) {
  var assets = JSON.parse(fs.readFileSync(config, 'utf8'));
  if (type) {
    var originalManifest = JSON.parse(fs.readFileSync(path.join(assets._out, 'manifest.json'), 'utf8'));
  }
  var manifest = {
      css: {}
    , js: {}
    , all: {}
  };
  
  config = path.dirname(config);
  config = {
      src: path.join(config, assets._src)
    , out: path.join(config, assets._out)
    , web: assets._web
    , str: {
        css: (assets._str && assets._str.css) || '<link rel=\'stylesheet\' href=\'%%\'>'
      , js: (assets._str && assets._str.js) || '<script src=\'%%\'></script>'
      }
  };
  if (type) {
    manifest = originalManifest;
    manifest[type] = {};
    async.eachSeries(Object.keys(manifest.all), function (key, next) {
      if (key.indexOf(type) >= 0) {
        delete manifest.all[key];
      };
      next();
    }, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

  
  async.eachSeries(Object.keys(assets), function (group, next) {
    if (!Array.isArray(assets[group])) {
      return setImmediate(next);
    }
    
    async.eachSeries(assets[group], function (name, next) {
      var proc = module.exports.types[path.extname(name).slice(1)];
      var file = path.join(config.src, name);
      if(type && path.extname(name).slice(1) !== type) {
        return next();
      }
      
      if (!proc) {
        return next('no type for ' + name);
      }
      
      var f = ff(function () {
        fs.readFile(file, 'utf8', f.slot());
      }, function (data) {
        proc.render(file, data, f.slot());
      }, function (data) {
        if (minify) {
          proc.minify(file, data, f.slot());
        } else {
          f.pass(data);
        }
      }, function (data) {
        manifest[proc.type][group] = (manifest[proc.type][group] || '') + data;
      }).onComplete(next);
    }, function (err) {
      if (err) {
        return next(err);
      }
      
      var f = ff(function () {
        if (!type) {
          var distcss = manifest.css[group];
          var distjs = manifest.js[group];
        } else if (type === 'css') {
          var distcss = manifest.css[group];
        } else if (type === 'js') {
          var distjs = manifest.js[group];
        }
        
        if (distcss) {
          var hashcss = crypto.createHash('md5').update(distcss).digest('hex').slice(0, 10);
          manifest.css[group] = config.str.css.replace('%%', config.web + '/dist-' + group + '.css');
          manifest.all[group + '.css'] = 'dist-' + group + '.css';
          fs.writeFile(path.join(config.out, 'dist-' + group + '.css'), distcss, f.wait());
        }
        
        if (distjs) {
          var hashjs = crypto.createHash('md5').update(distjs).digest('hex').slice(0, 10);
          manifest.js[group] = config.str.js.replace('%%', config.web + '/dist-' + group + '.js');
          manifest.all[group + '.js'] = 'dist-' + group + '.js';
          fs.writeFile(path.join(config.out, 'dist-' + group + '.js'), distjs, f.wait());
        }
      }).onComplete(next);
    });
  }, function (err) {
    if (err) {
      return next(err);
    }
    fs.writeFile(path.join(config.out, 'manifest.json'), JSON.stringify(manifest), next);
  });
};

module.exports.clean = function (config, next) {
  var out = path.join(path.dirname(config), JSON.parse(fs.readFileSync(config, 'utf8'))._out);
  var all = JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'), 'utf8')).all;
  
  var f = ff(function () {
    fs.readdir(out, f.slot());
  }, function (files) {
    files.forEach(function (file) {
      var key = file.split('-');
      
      if (key[0][0] !== '.' && key[0] !== 'manifest.json' && key[0] !== all[key[1]]) {
        fs.unlink(path.join(out, file), f.wait());
      }
    });
  }).onComplete(next);
};
