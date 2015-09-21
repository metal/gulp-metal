'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerAmdTasks = require('../../../lib/tasks/amd');
var registerSoyTasks = require('../../../lib/tasks/soy');
var sinon = require('sinon');

describe('AMD Build Task', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../../assets'));

		registerSoyTasks();
	});

	beforeEach(function(done) {
		del('build/amd', done);
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should output source files and their dependencies as amd modules', function(done) {
		registerAmdTasks({
			moduleName: 'foo'
		});

		gulp.start('build:amd', function() {
			assert.ok(fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});

	it('should look for source files according to the value of the "buildSrc" option', function(done) {
		registerAmdTasks({
			buildSrc: 'src/Bar.js',
			moduleName: 'foo'
		});

		gulp.start('build:amd', function() {
			assert.ok(!fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(!fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});

	it('should use given path as module id if it\'s prefixed with "module:"', function(done) {
		registerAmdTasks({
			buildSrc: 'amd/moduleAlias.js',
			moduleName: 'moduleAlias'
		});
		sinon.stub(console, 'warn');

		gulp.start('build:amd', function() {
			var modulePath = 'build/amd/moduleAlias/amd/moduleAlias.js';
			assert.ok(fs.existsSync(modulePath));

			var contents = fs.readFileSync(modulePath, 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('define([\'exports\', \'myModuleId\']'));

			console.warn.restore();
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		var options = {
			moduleName: 'foo',
			taskPrefix: 'myPrefix:'
		};
		registerAmdTasks(options);
		registerSoyTasks(options);

		gulp.start('myPrefix:build:amd', function() {
			assert.ok(fs.existsSync('build/amd/foo/src/Foo.js'));
			assert.ok(fs.existsSync('build/amd/foo/src/Bar.js'));
			assert.ok(fs.existsSync('build/amd/dep/src/core.js'));
			done();
		});
	});

	it('should normalize module dependencies path', function(done) {
		var options = {
			moduleName: 'foo\\bar'
		};
		registerAmdTasks(options);
		registerSoyTasks(options);

		gulp.start('build:amd', function() {
			assert.ok(fs.existsSync('build/amd/foo/bar/src/Foo.js'));

			var contents = fs.readFileSync('build/amd/foo/bar/src/Foo.js', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('\'foo/bar/src/Bar\''));
			done();
		});
	});

	describe('jQuery', function() {
		beforeEach(function(done) {
			del('build/amd-jquery', done);
		});

		it('should output source files and their dependencies as amd modules with jquery', function(done) {
			registerAmdTasks({
				moduleName: 'foo'
			});

			gulp.start('build:amd:jquery', function() {
				assert.ok(fs.existsSync('build/amd-jquery/foo/src/Foo.js'));
				assert.ok(fs.existsSync('build/amd-jquery/foo/src/Bar.js'));
				assert.ok(fs.existsSync('build/amd-jquery/dep/src/core.js'));

				var contents = fs.readFileSync('build/amd-jquery/foo/src/Foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter[\'default\'].register(\'foo\', Foo)'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			var options = {
				moduleName: 'foo',
				taskPrefix: 'myPrefix:'
			};
			registerAmdTasks(options);
			registerSoyTasks(options);

			gulp.start('myPrefix:build:amd:jquery', function() {
				assert.ok(fs.existsSync('build/amd-jquery/foo/src/Foo.js'));
				assert.ok(fs.existsSync('build/amd-jquery/foo/src/Bar.js'));
				assert.ok(fs.existsSync('build/amd-jquery/dep/src/core.js'));

				var contents = fs.readFileSync('build/amd-jquery/foo/src/Foo.js', 'utf8');
				assert.notStrictEqual(-1, contents.indexOf('JQueryAdapter[\'default\'].register(\'foo\', Foo)'));
				done();
			});
		});
	});
});
