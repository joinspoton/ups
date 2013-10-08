var coffee = require('coffee-script');

var js = require('./js');

module.exports.type = js.type;

module.exports.render = function (file, data, next) {
  try {
    data = coffee.compile(data, {
        filename: file
    });
  } catch (err) {
    return next(err);
  }
  
  js.render(file, data, next);
};

module.exports.minify = js.minify;