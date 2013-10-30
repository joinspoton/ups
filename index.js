var async = require('async');
var crypto = require('crypto');
var ff = require('ff');
var fs = require('fs');
var path = require('path');

module.exports.types = {
    css: require('./types/css')
  , js: require('./types/js')
};

module.exports.build = function (config, minify, next) {
  var assets = JSON.parse(fs.readFileSync(config, 'utf8'));
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
  
  async.eachSeries(Object.keys(assets), function (group, next) {
    if (!Array.isArray(assets[group])) {
      return setImmediate(next);
    }
    
    var hash = { css: '', js: '' };
    var dist = { css: '', js: '' };
    
    async.eachSeries(assets[group], function (file, next) {
      var proc = module.exports.types[path.extname(file).slice(1)];
      
      if (!proc) {
        return next('no type for ' + file);
      }
      
      var f = ff(function () {
        fs.readFile(path.join(config.src, file), 'utf8', f.slot());
      }, function (data) {
        proc.render(file, data, f.slot());
      }, function (data) {
        if (minify) {
          proc.minify(file, data, f.slot());
        } else {
          f.pass(data);
        }
      }, function (data) {
        hash[proc.type] += crypto.createHash('md5').update(data).digest('hex');
        dist[proc.type] += data;
      }).onComplete(next);
    }, function (err) {
      if (err) {
        return next(err);
      }
      
      var f = ff(function () {
        if (hash.css) {
          hash.css = crypto.createHash('md5').update(hash.css).digest('hex').slice(0, 10);
          manifest.css[group] = config.str.css.replace('%%', config.web + '/' + hash.css + '-' + group + '.css');
          manifest.all[group + '.css'] = hash.css;
          fs.writeFile(path.join(config.out, hash.css + '-' + group + '.css'), dist.css, f.wait());
        }
        
        if (hash.js) {
          hash.js = crypto.createHash('md5').update(hash.js).digest('hex').slice(0, 10);
          manifest.js[group] = config.str.js.replace('%%', config.web + '/' + hash.js + '-' + group + '.js');
          manifest.all[group + '.js'] = hash.js;
          fs.writeFile(path.join(config.out, hash.js + '-' + group + '.js'), dist.js, f.wait());
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