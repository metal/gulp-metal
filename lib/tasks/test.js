'use strict';

var fs = require('fs');
var gulp = require('gulp');
var karma = require('karma');
var karmaConfig = require('karma/lib/config');
var karmaFirefoxLauncher = require('karma-firefox-launcher');
var karmaIevms = require('karma-ievms');
var karmaSafariLauncher = require('karma-safari-launcher');
var karmaSauceLauncher = require('karma-sauce-launcher');
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
		var launchers = {
			sl_chrome: {
				base: 'SauceLabs',
				browserName: 'chrome'
			},
			sl_safari: {
				base: 'SauceLabs',
				browserName: 'safari'
			},
			sl_firefox: {
				base: 'SauceLabs',
				browserName: 'firefox'
			},
			sl_ie_9: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				platform: 'Windows 7',
				version: '9'
			},
			sl_ie_10: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				platform: 'Windows 7',
				version: '10'
			},
			sl_ie_11: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				platform: 'Windows 8.1',
				version: '11'
			},
			sl_iphone: {
				base: 'SauceLabs',
				browserName: 'iphone',
				platform: 'OS X 10.10',
				version: '7.1'
			},
			sl_android_4: {
				base: 'SauceLabs',
				browserName: 'android',
				platform: 'Linux',
				version: '4.4'
			},
			sl_android_5: {
				base: 'SauceLabs',
				browserName: 'android',
				platform: 'Linux',
				version: '5.0'
			}
		};

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
