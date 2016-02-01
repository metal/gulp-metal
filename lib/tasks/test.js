'use strict';

var babelRegister = require('babel-register');
var fs = require('fs');
var gulp = require('gulp');
var karma = require('karma');
var karmaConfig = require('karma/lib/config');
var karmaFirefoxLauncher = require('karma-firefox-launcher');
var karmaIevms = require('karma-ievms');
var karmaSafariLauncher = require('karma-safari-launcher');
var karmaSauceLauncher = require('karma-sauce-launcher');
var mocha = require('gulp-mocha');
var normalizeOptions = require('../options');
var openFile = require('open');
var path = require('path');
var runSequence = require('run-sequence');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'test', function(done) {
		runSequence(taskPrefix + 'test:unit', function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:unit', [taskPrefix + 'soy'], function(done) {
		runKarma({singleRun: true}, function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:coverage', [taskPrefix + 'soy'], function(done) {
		runKarma(
			{
				configFile: require.resolve('metal-karma-config/coverage'),
				singleRun: true
			},
			function() {
				done();
			},
			'coverage'
		);
	});

	gulp.task(taskPrefix + 'test:coverage:open', [taskPrefix + 'test:coverage'], function(done) {
		openFile(path.resolve('coverage/lcov/lcov-report/index.html'));
		done();
	});

	gulp.task(taskPrefix + 'test:browsers', [taskPrefix + 'soy'], function(done) {
		runKarma(
			{
				browsers: options.testBrowsers,
				plugins: [karmaFirefoxLauncher, karmaSafariLauncher, karmaIevms],
				singleRun: true
			},
			done,
			'browsers'
		);
	});

	gulp.task(taskPrefix + 'test:saucelabs', [taskPrefix + 'soy'], function(done) {
		var launchers = options.testSaucelabsBrowsers;
		runKarma({
			browsers: Object.keys(launchers),

			browserDisconnectTimeout: 10000,
			browserDisconnectTolerance: 2,
			browserNoActivityTimeout: 240000,

			captureTimeout: 240000,
			customLaunchers: launchers,

			plugins: [karmaSauceLauncher],

			reporters: ['progress', 'saucelabs'],

			sauceLabs: {
				testName: 'MetalJS tests',
				recordScreenshots: false,
				startConnect: true,
				connectOptions: {
					port: 5757,
					logfile: 'sauce_connect.log'
				}
			},

			singleRun: true
		}, done, 'sauce');
	});

	gulp.task(taskPrefix + 'test:watch', [taskPrefix + 'soy'], function(done) {
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);

		runKarma({}, done);
	});

	gulp.task('test:node', function() {
		return gulp.src(options.testNodeSrc)
			.pipe(mocha({
				compilers: [babelRegister({
					sourceMaps: 'both'
				})]
			}));
	});
};

// Private helpers
// ===============

function runKarma(config, done, opt_suffix) {
	var suffix = opt_suffix ? '-' + opt_suffix : '';
	var configFile = path.resolve('karma' + suffix + '.conf.js');
	var configGenericFile = path.resolve('karma.conf.js');
	if (fs.existsSync(configFile)) {
		config.configFile = configFile;
	} else if (fs.existsSync(configGenericFile)) {
		config.configFile = configGenericFile;
	} else if (!config.configFile) {
		config.configFile = require.resolve('metal-karma-config');
	}

	if (!config.basePath) {
		config.basePath = process.cwd();
	}

	if (config.plugins) {
		var configObj = new karmaConfig.Config();
		require(config.configFile)(configObj);

		var plugins = config.plugins;
		delete config.plugins;

		configObj.set(config);
		configObj.plugins = (configObj.plugins || []).concat(plugins);
		config = configObj;
	}
	new karma.Server(config, done).start();
}
