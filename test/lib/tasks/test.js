'use strict';

var assert = require('assert');
var gulp = require('gulp');
var karma = require('karma');
var rewire = require('rewire');
var sinon = require('sinon');

var openFile = sinon.stub();
var registerTestTasks = rewire('../../../lib/tasks/test');

describe('Test Tasks', function() {
	before(function() {
		gulp.task('soy', function(done) {
			done();
		});

		registerTestTasks.__set__('openFile', openFile);
	});

	beforeEach(function() {
		sinon.stub(karma.server, 'start').callsArg(1);
		openFile.callCount = 0;
	});

	afterEach(function() {
		karma.server.start.restore();
	});

	it('should run unit tests', function(done) {
		registerTestTasks();

		gulp.start('test', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma.conf.js'));
			assert.ok(config.singleRun);
			done();
		});
	});

	it('should run unit tests with the coverage karma config file when test:coverage is run', function(done) {
		registerTestTasks();

		gulp.start('test:coverage', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma-coverage.conf.js'));
			assert.ok(config.singleRun);
			done();
		});
	});

	it('should open coverage file when test:coverage:open is run', function(done) {
		registerTestTasks();

		assert.strictEqual(0, openFile.callCount);
		gulp.start('test:coverage:open', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma-coverage.conf.js'));
			assert.ok(config.singleRun);

			assert.strictEqual(1, openFile.callCount);
			done();
		});
	});

	it('should override browsers config when test:browsers is run', function(done) {
		registerTestTasks();

		gulp.start('test:browsers', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			done();
		});
	});

	it('should pass saucelabs config to karma when test:saucelabs is run', function(done) {
		registerTestTasks();

		gulp.start('test:saucelabs', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			assert.ok(config.sauceLabs);
			done();
		});
	});

	it('should pass singleRun as false when test:watch is run', function(done) {
		registerTestTasks();

		gulp.start('test:watch', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(!config.singleRun);
			done();
		});
	});

	it('should watch for soy file changes on test:watch', function(done) {
		registerTestTasks();
		sinon.stub(gulp, 'watch');

		gulp.start('test:watch', function() {
			assert.strictEqual(1, gulp.watch.callCount);
			assert.strictEqual('src/**/*.soy', gulp.watch.args[0][0]);
			assert.deepEqual(['soy'], gulp.watch.args[0][1]);

			gulp.watch.restore();
			done();
		});
	});

	describe('Task Prefix', function() {
		before(function() {
			registerTestTasks({
				taskPrefix: 'myPrefix:'
			});

			gulp.task('myPrefix:soy', function(done) {
				done();
			});
		});

		it('should use task prefix for "test" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				done();
			});
		});

		it('should use task prefix for "test:coverage" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:coverage', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				done();
			});
		});

		it('should use task prefix for "test:coverage:open" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:coverage:open', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				assert.strictEqual(1, openFile.callCount);
				done();
			});
		});

		it('should use task prefix for "test:browsers" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:browsers', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				done();
			});
		});

		it('should use task prefix for "test:saucelabs" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:saucelabs', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				done();
			});
		});

		it('should use task prefix for "test:watch" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:watch', function() {
				assert.strictEqual(1, karma.server.start.callCount);
				done();
			});
		});
	});
});
