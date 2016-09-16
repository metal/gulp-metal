'use strict';

var babelRegister = require('babel-register');
var babelPresetEs2015 = require('babel-preset-es2015');
var fs = require('fs');
var karmaConfig = require('karma/lib/config');
var karmaFirefoxLauncher = require('karma-firefox-launcher');
var karmaSafariLauncher = require('karma-safari-launcher');
var karmaSauceLauncher = require('karma-sauce-launcher');
var mocha = require('gulp-mocha');
var normalizeOptions = require('../options');
var openFile = require('open');
var path = require('path');
var runSequence = require('run-sequence');

module.exports = function(options) {
	options = normalizeOptions(options);
	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'test', function(done) {
		runSequence(taskPrefix + 'test:unit', function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:unit', [taskPrefix + 'soy'], function(done) {
		runKarma(options, {singleRun: true}, function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:coverage', [taskPrefix + 'soy'], function(done) {
		var configFile = 'metal-karma-config/';
		configFile += options.noSoy ? 'no-soy-coverage' : 'coverage';
		runKarma(
			options,
			{
				configFile: require.resolve(configFile),
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
		var plugins = [karmaFirefoxLauncher, karmaSafariLauncher];
		if (process.platform !== 'win32') {
			// Windows breaks when requiring "karma-ievms", and we don't really need
			// it there, so only require it when not on windows.
			plugins.push(require('karma-ievms'));
		}
		runKarma(
			options,
			{
				browsers: options.testBrowsers,
				plugins: plugins,
				singleRun: true
			},
			done,
			'browsers'
		);
	});

	gulp.task(taskPrefix + 'test:saucelabs', [taskPrefix + 'soy'], function(done) {
		var launchers = options.testSaucelabsBrowsers;
		var config = {
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
		};
		if (process.env.TRAVIS_JOB_NUMBER) {
			config.sauceLabs.startConnect = false;
			config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
		}
		runKarma(options, config, done, 'sauce');
	});

	gulp.task(taskPrefix + 'test:watch', [taskPrefix + 'soy'], function(done) {
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);

		runKarma(options, {}, done);
	});

	gulp.task('test:node', function() {
		return gulp.src(options.testNodeSrc)
			.pipe(mocha({
				compilers: [babelRegister({
					presets: [babelPresetEs2015],
					sourceMaps: 'both'
				})]
			}));
	});
};

// Private helpers
// ===============

function runKarma(options, config, done, opt_suffix) {
	var suffix = opt_suffix ? '-' + opt_suffix : '';
	var configFile = path.resolve('karma' + suffix + '.conf.js');
	var configGenericFile = path.resolve('karma.conf.js');
	if (fs.existsSync(configFile)) {
		config.configFile = configFile;
	} else if (fs.existsSync(configGenericFile)) {
		config.configFile = configGenericFile;
	} else if (!config.configFile) {
		configFile = 'metal-karma-config';
		configFile += options.noSoy ? '/no-soy' : '';
		config.configFile = require.resolve(configFile);
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
	new options.karma.Server(config, done).start();
}
