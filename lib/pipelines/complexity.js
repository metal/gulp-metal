'use strict';

var escomplex = require('typhonjs-escomplex');
var gutil = require('gulp-util');
var handleError = require('../handleError');
var open = require('open');
var path = require('path');
var plato = require('es6-plato');
var through = require('through2');

var chalk = gutil.colors;
var template = gutil.template;

module.exports.plato = function(options) {
	var name;

	try {
		name = require(path.join(process.cwd(), 'package.json')).name;
	} catch (e) {}

	var files = [];
	var platoArgs = {
		complexity: options.parserOptions,
		title: name || 'Metal'
	};

	return through.obj(function(file, encoding, callback) {
		files.push(file.path);
		callback();
	}, function(callback) {
		var stream = this;

		plato.inspect(files, options.dest, platoArgs, function() {
			var reportPath = path.join(process.cwd(), options.dest, 'index.html');

			gutil.log('Report generated at', gutil.colors.cyan(reportPath));

			open(reportPath);

			stream.emit('end');
			callback();
		});
	});
};

module.exports.run = function(options) {
	var padding = 0;
	var reports = [];

	return through.obj(function(file, encoding, callback) {
		var report = escomplex.analyzeModule(file.contents.toString(), options.parserOptions);

		var filePath = path.relative(process.cwd(), file.path);

		if (filePath.length > padding) {
			padding = filePath.length;
		}

		report.filePath = filePath;

		reports.push(report);

		callback();
	}, function(callback) {
		sortReports(reports);

		logMaintainability.call(this, reports, padding);

		logComplexity.call(this, reports, options.threshold);

		callback();
		this.emit('end');
	});
};

function concatReportFunctions(report) {
	var classes = report.classes;
	var methods = report.methods;

	if (classes.length) {
		classes.forEach(function(reportClass) {
			if (reportClass.methods && reportClass.methods.length) {
				methods = methods.concat(reportClass.methods);
			}
		});
	}

	return methods;
}

function getComplexFunctions(report, threshold) {
	var filePath = report.filePath;

	return concatReportFunctions(report).reduce(function(results, method) {
		var halstead = method.halstead;

		if (method.cyclomatic > threshold.cyclomatic || halstead.difficulty > threshold.halstead) {
			results.push(template(
				'<%= filePath %>:<%= method.lineStart %> <%= method.name %> is too complicated\n' +
				'    Cyclomatic: <%= method.cyclomatic %>\n' +
				'    Halstead: <%= method.halstead.difficulty %>\n' +
				'      | Effort: <%= method.halstead.effort %>\n' +
				'      | Volume: <%= method.halstead.volume %>\n' +
				'      | Vocabulary: <%= method.halstead.vocabulary %>\n',
				{
					file: {},
					filePath: filePath,
					method: method
				}
			));
		}

		return results;
	}, []);
}

function logComplexity(reports, threshold) {
	var logs = reports.reduce(function(results, report) {
		return results.concat(getComplexFunctions(report, threshold));
	}, []);

	if (logs.length) {
		logs.splice(0, 0, chalk.white('Logging method complexity...\n'));

		gutil.log(chalk.yellow(logs.join('')));

		var error = new Error(logs.length + ' function(s) are too complicated.');

		if (threshold.breakOnError) {
			this.emit('error', error);
		} else {
			handleError.call(this, error, 'complexity');
		}
	}
}

function logMaintainability(reports, padding) {
	var logs = reports.map(function(report) {
		var color = chalk.green;

		if (report.maintainability < 60) {
			color = chalk.red;
		} else if (report.maintainability < 80) {
			color = chalk.yellow;
		}

		var filePath = (report.filePath + Array(padding).join(' ')).substring(0, padding);

		return '\n' + filePath + ' ' + color(report.maintainability);
	});

	logs.splice(0, 0, 'Logging file maintainability...');

	gutil.log.apply(this, logs);
}

function sortReports(reports) {
	reports.sort(function(a, b) {
		if (a.maintainability > b.maintainability) {
			return -1;
		}
		if (a.maintainability < b.maintainability) {
			return 1;
		}

		return 0;
	});
}
