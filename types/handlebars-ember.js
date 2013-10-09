var handlebars = require('ember-handlebars');
var path = require('path');
var util = require('util');

var js = require('./js');

module.exports.type = js.type;

module.exports.render = function (file, data, next) {
  var name = path.basename(file, path.extname(file));
  
  try {
    data = handlebars.precompile(data);
  } catch (err) {
    return next(err);
  }
  
  data = util.format('Ember.TEMPLATES["%s"] = Ember.Handlebars.template(%s)', name, data);
  
  js.render(file, data, next);
};

module.exports.minify = js.minify;