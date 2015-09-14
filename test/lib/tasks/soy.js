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

	it('should add lines to generated soy js file that import ComponentRegistry', function(done) {
		registerTasks({
			soyDest: 'soy',
			soySrc: ['soy/simple.soy']
		});

		gulp.start('soy', function() {
			var contents = fs.readFileSync('soy/simple.soy.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'bower:metal/src/component/ComponentRegistry\';'));
			done();
		});
	});

	it('should normalize the path that imports ComponentRegistry', function(done) {
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

	it('should import ComponentRegistry according to core path indicated by the corePathFromSoy option', function(done) {
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

	it('should import ComponentRegistry according to core path indicated by the result of the corePathFromSoy option fn', function(done) {
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
	// Remove the first 3 lines, since they have an ES6 import declaration.
	contents.splice(0, 3);
	// Remove the last 3 lines, since they have an ES6 export declaration.
	contents.splice(contents.length - 3, 3);
	contents = contents.join('\n');
	eval(contents);
}
