var less = require('less');

var css = require('./css');

module.exports.type = css.type;

module.exports.render = function (file, data, next) {
  less.render(data, {
      filename: file
  }, function (err, data) {
    if (err) {
      return next(err);
    }
    
    css.render(file, data, next);
  });
};

module.exports.minify = css.minify;