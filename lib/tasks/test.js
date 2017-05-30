'use strict';

var babelPresetEs2015 = require('babel-preset-es2015');
var babelRegister = require('babel-register');
var fs = require('fs');
var gutil = require('gulp-util');
var karmaConfig = require('karma/lib/config');
var karmaFirefoxLauncher = require('karma-firefox-launcher');
var karmaSafariLauncher = require('karma-safari-launcher');
var karmaSauceLauncher = require('karma-sauce-launcher');
var mocha = require('gulp-mocha');
var normalizeOptions = require('../options');
var openFile = require('open');
var path = require('path');
var through = require('through2');
var jest = require('jest-cli');


module.exports = function(options) {
	options = normalizeOptions(options);
	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	var runSequence = require('run-sequence').use(gulp);

	var testSnapshot = function(file, encoding, cb) {
		options = Object.assign({}, options, {
			config: Object.assign({
				rootDir: file ? file.path : undefined
			}, options.config)
		});

		jest.runCLI(options, [options.config.rootDir], (result) => {
			if(result.numFailedTests || result.numFailedTestSuites) {
				cb(new gutil.PluginError('gulp-jest', { message: 'Tests Failed' }));
			} else {
				cb();
			}
		});
	};

	gulp.task(taskPrefix + 'test', function(done) {
		runSequence(/*[taskPrefix + 'test:unit', */taskPrefix + 'test:snapshot'/*]*/, function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:unit', options.testDepTasks, function(done) {
		runKarma(options, {singleRun: true}, function(exitCode) {
			var err;

			if (exitCode) {
				err = new gutil.PluginError('gulp-metal', 'Karma has exited with ' + exitCode);
			}

			done(err);
		});
	});

	gulp.task(taskPrefix + 'test:snapshot', options.testDepTasks, function() {
		var gulpOpts = {
			base: process.cwd()
		};

		return gulp.src('src/__tests__/**/*.js', gulpOpts)
	    .pipe(through.obj(testSnapshot));
	});

	gulp.task(taskPrefix + 'test:coverage', options.testDepTasks, function(done) {
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

	gulp.task(taskPrefix + 'test:browsers', options.testDepTasks, function(done) {
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

	gulp.task(taskPrefix + 'test:saucelabs', options.testDepTasks, function(done) {
		var launchers = options.testSaucelabsBrowsers;
		var config = {
			browsers: Object.keys(launchers),

			browserDisconnectTimeout: 10000,
			browserDisconnectTolerance: 2,
			browserNoActivityTimeout: 240000,

			captureTimeout: 240000,
			customLaunchers: launchers,

			plugins: [karmaSauceLauncher],

			reporters: ['dots', 'saucelabs'],

			sauceLabs: options.sauceLabs,

			singleRun: true
		};

		setSaucelabsSecurity(config);
		runKarma(options, config, done, 'sauce');
	});

	gulp.task(taskPrefix + 'test:watch', options.testDepTasks, function(done) {
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

function setSaucelabsSecurity(karmaConfig) {
	var sauceAccesssKey = process.env.SAUCE_ACCESS_KEY;
	if (sauceAccesssKey) {
		karmaConfig.sauceLabs.startConnect = false;
		karmaConfig.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
	}
	else {
		var key = process.env.SAUCE_ACCESS_KEY_ENC;
		if (key) {
			karmaConfig.sauceLabs.accessKey = new Buffer(key, 'base64').toString('binary');
		}
	}
}

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
