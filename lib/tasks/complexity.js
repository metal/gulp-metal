'use strict';

var complexity = require('../pipelines/complexity');
var normalizeOptions = require('../options');

module.exports = function(options) {
	options = normalizeOptions(options);
	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'complexity:report', function() {
		return gulp.src(options.complexityGlobs)
			.pipe(complexity.plato({
				dest: options.complexityDest,
				parserOptions: options.complexityParserOptions
			}));
	});
};
