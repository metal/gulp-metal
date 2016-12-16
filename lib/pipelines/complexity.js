'use strict';

var gutil = require('gulp-util');
var open = require('open');
var path = require('path');
var plato = require('es6-plato');
var through = require('through2');

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
