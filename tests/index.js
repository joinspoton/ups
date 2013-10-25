var assert = require('assert');
var ff = require('ff');
var fs = require('fs');
var ups = require('ups');

describe('ups.build()', function () {
  it('should create assets');
  
  it('should create the manifest');
  
  it('should customize group strings');
  
  it('should be deterministic');
});

describe('ups.clean()', function () {
  it('should delete extraneous files', function (next) {
    var f = ff(function () {
      ups.clean('', f.wait());
    }, function () {
      fs.readdir('', f.slot());
    }, function (list) {
      assert.deepEqual(list, []);
    }).onComplete(next);
  });
  
  it('should ignore valid assets');
  
  it('should ignore the manifest');
  
  it('should ignore dotfiles');
});

describe('ups.types', function () {
  it('should handle custom types');
});

describe('ups/types', function () {
  describe('coffeescript', function () {
    it('should render CoffeeScript');
  });
  
  describe('css', function () {
    it('should render CSS');
  });
  
  describe('handlebars', function () {
    it('should render Handlebars');
  });
  
  describe('handlebars-ember', function () {
    it('should render Emberized Handlebars');
  });
  
  describe('js', function () {
    it('should render JS');
  });
  
  describe('less', function () {
    it('should render LESS');
  });
  
  describe('stylus', function () {
    it('should render Stylus');
  });
  
  describe('stylus-nib', function () {
    it('should render Stylus with Nib');
  });
});