var nib = require('nib')
  , stylus = require('stylus')
  , css = require('./css')

module.exports.type = css.type

module.exports.render = function (file, data, next) {
  stylus(data)
    .set('filename', file)
    .use(nib())
    .import('nib')
    .render(function (err, data) {
      if (err) return next(err)
      
      css.render(file, data, next)
    })
}

module.exports.minify = css.minify