var uglify = require('uglify-js');

module.exports.type = 'js';

module.exports.render = function (file, data, next) {
  data = data + ';';
  
  next(null, data);
};

module.exports.minify = function (file, data, next) {
  data = uglify.minify(data, { fromString: true }).code;
  
  next(null, data);
};