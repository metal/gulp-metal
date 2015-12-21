'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var merge = require('merge');
var mockery = require('mockery');
var rewire = require('rewire');
var sinon = require('sinon');

var karmaStub = {};
var karmaConfig = {};
var openFile = sinon.stub();
var registerTestTasks = rewire('../../../lib/tasks/test');

describe('Test Tasks', function() {
	before(function() {
		registerTestTasks.__set__('openFile', openFile);
		registerTestTasks.__set__('karma', karmaStub);
		registerTestTasks.__set__('karmaConfig', karmaConfig);

		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.registerMock(require.resolve('metal-karma-config'), function(config) {
			config.set({
				plugins: ['another']
			});
		});
	});

	beforeEach(function() {
		gulp.reset();
		gulp.task('soy', function(done) {
			done();
		});

		karmaStub.Server = function(config, callback) {
			return {
				start: function() {
					callback();
				}
			};
		};
		karmaConfig.Config = function() {
			this.set = function(options) {
				merge(this, options);
			};
		};
		sinon.spy(karmaStub, 'Server');
		openFile.callCount = 0;
	});

	afterEach(function() {
		karmaStub.Server.restore();
	});

	after(function() {
		mockery.disable();
	});

	it('should run unit tests', function(done) {
		registerTestTasks();

		gulp.start('test', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('metal-karma-config'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);
			done();
		});
	});

	it('should run unit tests with karma.conf.js file', function(done) {
		registerTestTasks();
		sinon.stub(fs, 'existsSync').returns(true);

		gulp.start('test', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma.conf.js'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);

			fs.existsSync.restore();
			done();
		});
	});

	it('should run unit tests with the coverage karma config', function(done) {
		registerTestTasks();

		gulp.start('test:coverage', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('metal-karma-config/coverage'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);
			done();
		});
	});

	it('should run unit tests with the coverage karma config file', function(done) {
		registerTestTasks();
		sinon.stub(fs, 'existsSync').returns(true);

		gulp.start('test:coverage', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma-coverage.conf.js'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);

			fs.existsSync.restore();
			done();
		});
	});

	it('should run unit tests with the generic karma config file', function(done) {
		registerTestTasks();
		sinon.stub(fs, 'existsSync', function(path) {
			return path.indexOf('karma-coverage.conf.js') === -1;
		});

		gulp.start('test:coverage', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('karma.conf.js'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);

			fs.existsSync.restore();
			done();
		});
	});

	it('should open coverage file when test:coverage:open is run', function(done) {
		registerTestTasks();

		assert.strictEqual(0, openFile.callCount);
		gulp.start('test:coverage:open', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.notStrictEqual(-1, config.configFile.indexOf('metal-karma-config/coverage'));
			assert.ok(config.singleRun);
			assert.strictEqual(process.cwd(), config.basePath);

			assert.strictEqual(1, openFile.callCount);
			done();
		});
	});

	it('should override browsers and plugins config when test:browsers is run', function(done) {
		registerTestTasks();

		gulp.start('test:browsers', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			assert.ok(config.plugins.length > 3);
			done();
		});
	});

	it('should pass saucelabs config to karma when test:saucelabs is run', function(done) {
		registerTestTasks();

		gulp.start('test:saucelabs', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			assert.ok(config.plugins.length > 1);
			assert.ok(config.sauceLabs);
			done();
		});
	});

	it('should pass singleRun as false when test:watch is run', function(done) {
		registerTestTasks();

		gulp.start('test:watch', function() {
			assert.strictEqual(1, karmaStub.Server.callCount);

			var config = karmaStub.Server.args[0][0];
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
		beforeEach(function() {
			registerTestTasks({
				taskPrefix: 'myPrefix:'
			});

			gulp.task('myPrefix:soy', function(done) {
				done();
			});
		});

		it('should use task prefix for "test" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				done();
			});
		});

		it('should use task prefix for "test:coverage" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:coverage', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				done();
			});
		});

		it('should use task prefix for "test:coverage:open" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:coverage:open', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				assert.strictEqual(1, openFile.callCount);
				done();
			});
		});

		it('should use task prefix for "test:browsers" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:browsers', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				done();
			});
		});

		it('should use task prefix for "test:saucelabs" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:saucelabs', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				done();
			});
		});

		it('should use task prefix for "test:watch" task when it\'s defined', function(done) {
			gulp.start('myPrefix:test:watch', function() {
				assert.strictEqual(1, karmaStub.Server.callCount);
				done();
			});
		});
	});
});
