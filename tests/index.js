var assert = require('assert');
var async = require('async');
var crypto = require('crypto');
var csso = require('csso');
var ff = require('ff');
var fixtures = require('test-fixtures');
var shell = require('shelljs');
var uglify = require('uglify-js');
var ups = require('..');

shell.cd(__dirname);
shell.rm('-r', 'publics');
shell.mkdir('publics');

var hash = function (data) {
  return crypto.createHash('md5').update(data).digest('hex').slice(0, 10);
};

var files = {
    global_css: fixtures.css.foundation.load() + fixtures.css.jqueryui.load()
  , global_css_min: csso.justDoIt(fixtures.css.foundation.load()) + csso.justDoIt(fixtures.css.jqueryui.load())
  , global_js: fixtures.js.ember.load() + ';' + fixtures.js.jqueryui.load() + ';'
  , global_js_min: uglify.minify(fixtures.js.ember.load(), { fromString: true }).code + uglify.minify(fixtures.js.jqueryui.load(), { fromString: true }).code
  , index_css: shell.cat('sources/css.css')
  , index_css_min: csso.justDoIt(shell.cat('sources/css.css'))
  , index_js: shell.cat('sources/js.js') + ';'
  , index_js_min: uglify.minify(shell.cat('sources/js.js'), { fromString: true }).code
};

var hashes = {
    global_css: hash(files.global_css)
  , global_css_min: hash(files.global_css_min)
  , global_js: hash(files.global_js)
  , global_js_min: hash(files.global_js_min)
  , index_css: hash(files.index_css)
  , index_css_min: hash(files.index_css_min)
  , index_js: hash(files.index_js)
  , index_js_min: hash(files.index_js_min)
};

var manifests = {
    basic: {"css":{"global":"<link rel='stylesheet' href='/ups/"+hashes.global_css+"-global.css'>","index":"<link rel='stylesheet' href='/ups/"+hashes.index_css+"-index.css'>"},"js":{"global":"<script src='/ups/"+hashes.global_js+"-global.js'></script>","index":"<script src='/ups/"+hashes.index_js+"-index.js'></script>"},"all":{"global.css":hashes.global_css,"global.js":hashes.global_js,"index.css":hashes.index_css,"index.js":hashes.index_js}}
  , basicMin: {"css":{"global":"<link rel='stylesheet' href='/ups/"+hashes.global_css_min+"-global.css'>","index":"<link rel='stylesheet' href='/ups/"+hashes.index_css_min+"-index.css'>"},"js":{"global":"<script src='/ups/"+hashes.global_js_min+"-global.js'></script>","index":"<script src='/ups/"+hashes.index_js_min+"-index.js'></script>"},"all":{"global.css":hashes.global_css_min,"global.js":hashes.global_js_min,"index.css":hashes.index_css_min,"index.js":hashes.index_js_min}}
  , types: {"css":{"css":"<link rel='stylesheet' href='/ups/f13c2c05cf-css.css'>","less":"<link rel='stylesheet' href='/ups/b83abab1da-less.css'>","less_import":"<link rel='stylesheet' href='/ups/b83abab1da-less_import.css'>","stylus":"<link rel='stylesheet' href='/ups/1349d685e3-stylus.css'>","stylus_import":"<link rel='stylesheet' href='/ups/a6e6c7f1c5-stylus_import.css'>","nib":"<link rel='stylesheet' href='/ups/25169cfd91-nib.css'>"},"js":{"coffeescript":"<script src='/ups/4e68e71cbf-coffeescript.js'></script>","handlebars":"<script src='/ups/238cab0e55-handlebars.js'></script>","ember":"<script src='/ups/6428bda773-ember.js'></script>","js":"<script src='/ups/024f88cca3-js.js'></script>"},"all":{"coffeescript.js":"4e68e71cbf","css.css":"f13c2c05cf","handlebars.js":"238cab0e55","ember.js":"6428bda773","js.js":"024f88cca3","less.css":"b83abab1da","less_import.css":"b83abab1da","stylus.css":"1349d685e3","stylus_import.css":"a6e6c7f1c5","nib.css":"25169cfd91"}}
};

describe('ups.build()', function () {
  this.timeout(0);
  
  it('should create assets and the manifest', function (next) {
    var f = ff(function () {
      ups.build(__dirname + '/configs/basic.json', false, f.wait());
    }, function () {
      assert.deepEqual(JSON.parse(shell.cat('publics/manifest.json')), manifests.basic);
      
      assert.equal(shell.cat('publics/' + hashes.global_css + '-global.css'), files.global_css);
      assert.equal(shell.cat('publics/' + hashes.global_js + '-global.js'), files.global_js);
      assert.equal(shell.cat('publics/' + hashes.index_css + '-index.css'), files.index_css);
      assert.equal(shell.cat('publics/' + hashes.index_js + '-index.js'), files.index_js);
    }).onComplete(next);
  });
  
  it('should compress assets', function (next) {
    var f = ff(function () {
      ups.build(__dirname + '/configs/basic.json', true, f.wait());
    }, function () {
      assert.deepEqual(JSON.parse(shell.cat('publics/manifest.json')), manifests.basicMin);
      
      assert.equal(shell.cat('publics/' + hashes.global_css_min + '-global.css'), files.global_css_min);
      assert.equal(shell.cat('publics/' + hashes.global_js_min + '-global.js'), files.global_js_min);
      assert.equal(shell.cat('publics/' + hashes.index_css_min + '-index.css'), files.index_css_min);
      assert.equal(shell.cat('publics/' + hashes.index_js_min + '-index.js'), files.index_js_min);
    }).onComplete(next);
  });
});

describe('ups.clean()', function () {
  beforeEach(function (next) {
    shell.rm('-r', 'publics');
    shell.mkdir('publics');
    
    ups.build(__dirname + '/configs/basic.json', false, next);
  });
  
  it('should delete extraneous files', function (next) {
    var f = ff(function () {
      ''.to('publics/foofile');
      'a+b=c'.to('publics/xxx-old.asset');
      
      ups.clean(__dirname + '/configs/basic.json', f.wait());
    }, function () {
      assert.deepEqual(shell.ls('-A', 'publics').sort(), [hashes.global_css + '-global.css', hashes.global_js + '-global.js', hashes.index_css + '-index.css', hashes.index_js + '-index.js', 'manifest.json'].sort());
    }).onComplete(next);
  });
  
  it('should ignore valid assets, the manifest, and dotfiles', function (next) {
    var f = ff(function () {
      'dotdotdot'.to('publics/.dotfile');
      ''.to('publics/.placeholder');
      
      ups.clean(__dirname + '/configs/basic.json', f.wait());
    }, function () {
      assert.deepEqual(shell.ls('-A', 'publics').sort(), ['.dotfile', '.placeholder', hashes.global_css + '-global.css', hashes.global_js + '-global.js', hashes.index_css + '-index.css', hashes.index_js + '-index.js', 'manifest.json'].sort());
    }).onComplete(next);
  });
});

describe('ups/types', function () {
  var manifest;
  
  before(function (next) {
    var f = ff(function () {
      ups.types.coffee = require('../types/coffeescript');
      ups.types.handlebars = require('../types/handlebars');
      ups.types.hbs = require('../types/handlebars-ember');
      ups.types.less = require('../types/less');
      ups.types.stylus = require('../types/stylus');
      ups.types.styl = require('../types/stylus-nib');
      
      shell.rm('-r', 'publics');
      shell.mkdir('publics');
      
      ups.build(__dirname + '/configs/types.json', false, f.wait());
    }, function () {
      manifest = JSON.parse(shell.cat('publics/manifest.json'));
    }).onComplete(next);
  });
  
  describe('coffeescript', function () {
    it('should render CoffeeScript', function () {
      assert.equal(manifest.all['coffeescript.js'], manifests.types.all['coffeescript.js']);
    });
  });
  
  describe('css', function () {
    it('should render CSS', function () {
      assert.equal(manifest.all['css.css'], manifests.types.all['css.css']);
    });
  });
  
  describe('handlebars', function () {
    it('should render Handlebars', function () {
      assert.equal(manifest.all['handlebars.js'], manifests.types.all['handlebars.js']);
    });
  });
  
  describe('handlebars-ember', function () {
    it('should render Emberized Handlebars', function () {
      assert.equal(manifest.all['ember.js'], manifests.types.all['ember.js']);
    });
  });
  
  describe('js', function () {
    it('should render JS', function () {
      assert.equal(manifest.all['js.js'], manifests.types.all['js.js']);
    });
  });
  
  describe('less', function () {
    it('should render LESS', function () {
      assert.equal(manifest.all['less.css'], manifests.types.all['less.css']);
    });
    
    it('should process imports', function () {
      assert.equal(manifest.all['less_import.css'], manifests.types.all['less_import.css']);
    });
  });
  
  describe('stylus', function () {
    it('should render Stylus', function () {
      assert.equal(manifest.all['stylus.css'], manifests.types.all['stylus.css']);
    });
    
    it('should process imports', function () {
      assert.equal(manifest.all['stylus_import.css'], manifests.types.all['stylus_import.css']);
    });
  });
  
  describe('stylus-nib', function () {
    it('should render Stylus with Nib', function () {
      assert.equal(manifest.all['nib.css'], manifests.types.all['nib.css']);
    });
  });
});