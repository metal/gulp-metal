'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
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
