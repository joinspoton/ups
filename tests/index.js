var assert = require('assert');
var crypto = require('crypto');
var ff = require('ff');
var shell = require('shelljs');
var ups = require('..');

var hash = function (data) {
  return crypto.createHash('md5').update(data).digest('hex');
};

before(function () {
  shell.cd(__dirname);
  shell.rm('-r', 'publics');
  shell.mkdir('publics');
});

after(function () {
  shell.rm('-r', 'publics');
});

describe('ups.build()', function () {
  it('should create assets');
  
  it('should create the manifest');
  
  it('should customize group strings');
  
  it('should compress assets');
  
  it('should be deterministic');
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
      assert.deepEqual(shell.ls('-A', 'publics'), ['3a32d3bc8e-global.js', 'manifest.json']);
    }).onComplete(next);
  });
  
  it('should ignore valid assets, the manifest, and dotfiles', function (next) {
    var f = ff(function () {
      'dotdotdot'.to('publics/.dotfile');
      ''.to('publics/.placeholder');
      
      ups.clean(__dirname + '/configs/basic.json', f.wait());
    }, function () {
      assert.deepEqual(shell.ls('-A', 'publics'), ['.dotfile', '.placeholder', '3a32d3bc8e-global.js', 'manifest.json']);
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
      assert.equal(manifest.all['coffeescript.js'], 'a638d3300f');
    });
  });
  
  describe('css', function () {
    it('should render CSS', function () {
      assert.equal(manifest.all['css.css'], '3672c5f0b6');
    });
  });
  
  describe('handlebars', function () {
    it('should render Handlebars', function () {
      assert.equal(manifest.all['handlebars.js'], 'd656caf90f');
    });
  });
  
  describe('handlebars-ember', function () {
    it('should render Emberized Handlebars', function () {
      assert.equal(manifest.all['ember.js'], '45b4077ffc');
    });
  });
  
  describe('js', function () {
    it('should render JS', function () {
      assert.equal(manifest.all['js.js'], 'e3265f70cc');
    });
  });
  
  describe('less', function () {
    it('should render LESS', function () {
      assert.equal(manifest.all['less.css'], '20016d933a');
    });
  });
  
  describe('stylus', function () {
    it('should render Stylus', function () {
      assert.equal(manifest.all['stylus.css'], '4bf19df04b');
    });
  });
  
  describe('stylus-nib', function () {
    it('should render Stylus with Nib', function () {
      assert.equal(manifest.all['nib.css'], '7589b54712');
    });
  });
});