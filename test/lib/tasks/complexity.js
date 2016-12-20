'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var registerTasks = require('../../../lib/tasks/index');

describe('Complexity Task', function() {
	before(function(done) {
		this.initialCwd_ = process.cwd();
		process.chdir(path.join(__dirname, '../../assets/complexity'));
		del(['artifacts/**']).then(function() {
			done();
		});
	});

	beforeEach(function() {
		gulp.reset();
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should log maintainability of files and complexity of methods', function(done) {
		registerComplexityTasks({
			complexityGlobs: ['**/*.js'],
			complexityThreshold: {
				breakOnError: false,
				cyclomatic: 3,
				halstead: 8
			},
			gulp: gulp
		});

		sinon.stub(gutil, 'log');

		gulp.start('complexity', function() {
			var args = gutil.log.getCall(0).args;

			assert.equal(gutil.colors.stripColor(args[1]), '\nFoo.js 92.258');
			assert.equal(gutil.colors.stripColor(args[2]), '\nBar.js 72.635');

			args = gutil.log.getCall(1).args;

			var complexFnLog = gutil.colors.stripColor(args[0]);

			assert(complexFnLog.indexOf('Bar.js:4 complexFn is too complicated') > -1);

			gutil.log.restore();

			done();
		});
	});

	it('should break on complex functions', function(done) {
		registerComplexityTasks({
			complexityGlobs: ['**/*.js'],
			gulp: gulp
		});

		gulp.start('complexity', function(err) {
			assert(err.message.indexOf('2 function(s) are too complicated') > -1);

			done();
		});
	});

	it('should generate report based on complexityGlobs', function(done) {
		registerTasks({
			complexityGlobs: ['**/*.js'],
			gulp: gulp
		});

		gulp.start('complexity:report', function() {
			assert.ok(fs.existsSync('artifacts/plato/index.html'));

			var report = require(path.join(process.cwd(), 'artifacts/plato/report.json'));

			assert(report.summary);
			assert.equal(report.reports.length, 2);

			done();
		});
	});
});
