var csso = require('csso');

module.exports.type = 'css';

module.exports.render = function (file, data, next) {
  next(null, data);
};

module.exports.minify = function (file, data, next) {
  data = csso.justDoIt(data);
  
  next(null, data);
};