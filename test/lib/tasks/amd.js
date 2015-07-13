'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerAmdTasks = require('../../../lib/tasks/amd');
var registerSoyTasks = require('../../../lib/tasks/soy');

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
