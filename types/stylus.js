var nib = require('nib')
  , stylus = require('stylus')
  , css = require('./css')

module.exports.type = css.type

module.exports.render = function (file, data, next) {
  try {
    data = stylus(data)
      .set('filename', file)
      .use(nib())
      .import('nib')
  } catch (err) {
    return next(err)
  }
  
  css.render(file, data, next)
}

module.exports.minify = css.minify