'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../../lib/tasks/index');
var soyPipelines = require('../../../lib/pipelines/soy');
var sinon = require('sinon');
require('../../fixture/soyutils-mock');

global.Templates = {};

describe('Soy Task', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../../assets'));
	});

	beforeEach(function() {
		gulp.reset();
		Templates = {};
		soyPipelines.reset();
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should set the "params" variable for each template, with a list of its param names', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			loadSoyFile('soy/simple.soy.js');

			assert.ok(Templates.Simple.hello.params);
			assert.ok(!Templates.Simple.hello.private);
			assert.deepEqual(['firstName', 'lastName'], Templates.Simple.hello.params);

			done();
		});
	});

	it('should set the "private" variable to true for private templates', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/privateTemplate.soy']
		});

		gulp.start('soy', function() {
			loadSoyFile('soy/privateTemplate.soy.js');

			assert.ok(!Templates.PrivateTemplate.content.private);
			assert.ok(Templates.PrivateTemplate.content.params);

			assert.ok(Templates.PrivateTemplate.hello.private);
			assert.ok(!Templates.PrivateTemplate.hello.params);
			done();
		});
	});

	it('should set the "static" variable to true for templates with the @static doc tag', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/static.soy']
		});

		gulp.start('soy', function() {
			loadSoyFile('soy/static.soy.js');

			assert.ok(!Templates.Static.content.static);
			assert.ok(Templates.Static.hello.static);

			done();
		});
	});

	it('should not add params listed in "skipUpdates" to the "params" variable', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/skipUpdates.soy']
		});

		gulp.start('soy', function() {
			loadSoyFile('soy/skipUpdates.soy.js');

			assert.ok(Templates.SkipUpdates.hello.params);
			assert.deepEqual(['foobar'], Templates.SkipUpdates.hello.params);

			done();
		});
	});

	it('should add lines to generated soy js file that import some metal ES6 modules', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('import Component from \'bower:metal/src/component/Component\';'));
			assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'bower:metal/src/component/ComponentRegistry\';'));
			assert.notStrictEqual(-1, contents.indexOf('import SoyAop from \'bower:metal/src/soy/SoyAop\';'));
			assert.notStrictEqual(-1, contents.indexOf('import SoyRenderer from \'bower:metal/src/soy/SoyRenderer\';'));
			assert.notStrictEqual(-1, contents.indexOf('import SoyTemplates from \'bower:metal/src/soy/SoyTemplates\';'));
			done();
		});
	});

	it('should normalize import paths', function(done) {
		registerTasks({
			corePathFromSoy: 'some\\path',
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.strictEqual(-1, contents.indexOf('import ComponentRegistry from \'some\\path/component/ComponentRegistry\';'));
			assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'some/path/component/ComponentRegistry\';'));
			done();
		});
	});

	it('should import ES6 modules according to core path indicated by the corePathFromSoy option', function(done) {
		registerTasks({
			corePathFromSoy: 'some/path',
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.strictEqual(-1, contents.indexOf('import ComponentRegistry from \'bower:metal/src/component/ComponentRegistry\';'));
			assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'some/path/component/ComponentRegistry\';'));
			done();
		});
	});

	it('should import ES6 modules according to core path indicated by the result of the corePathFromSoy option fn', function(done) {
		registerTasks({
			corePathFromSoy: function() {
				return 'fn/path';
			},
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.strictEqual(-1, contents.indexOf('import ComponentRegistry from \'bower:metal/src/component/ComponentRegistry\';'));
			assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'fn/path/component/ComponentRegistry\';'));
			done();
		});
	});

	it('should automatically generate component class using SoyRenderer', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('class Simple extends Component'));
			assert.notStrictEqual(-1, contents.indexOf('Simple.RENDERER = SoyRenderer;'));
			done();
		});
	});

	it('should export generated component class', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('export default Simple;'));
			done();
		});
	});

	it('should call SoyAop.registerTemplates', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('SoyAop.registerTemplates(\'Simple\');'));
			done();
		});
	});

	it('should generate missing js component file when "soyShouldGenerateJsComponent" is set to true', function(done) {
		registerTasks({
			soyDest: 'soy',
			soyShouldGenerateJsComponent: true,
			soySrc: 'soy/simple.soy'
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('class Simple extends SoyComponent'));
			del('soy/simple.js', done);
		});
	});

	it('should not generate missing js component file when "soyShouldGenerateJsComponent" is not set to true', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: 'soy/simple.soy'
		});

		gulp.start('soy', function() {
			assert.ok(!fs.existsSync('soy/simple.js'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy'],
			taskPrefix: 'myPrefix:'
		});

		gulp.start('myPrefix:soy', function() {
			loadSoyFile('soy/simple.soy.js');

			assert.ok(Templates.Simple);
			assert.ok(Templates.Simple.content);
			assert.ok(Templates.Simple.hello);

			done();
		});
	});

	it('should trigger "end" event even when task throws error for invalid soy file', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/invalid.soy']
		});
		sinon.stub(console, 'error');

		gulp.start('soy', function() {
			assert.strictEqual(2, console.error.callCount);
			console.error.restore();
			done();
		});
	});
});

function loadSoyFile(filePath) {
	var contents = fs.readFileSync(filePath, 'utf8');
	contents = contents.split('\n');
	// Remove the first 8 lines, since they have ES6 import declarations.
	contents.splice(0, 8);
	// Remove the last 3 lines, since they have an ES6 class definition and an
	// export declaration.
	contents.splice(contents.length - 11, 11);
	contents = contents.join('\n');
	eval(contents);
}
