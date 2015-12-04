'use strict';

var combiner = require('stream-combiner');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

module.exports = function() {
	return combiner(
		rename({
			suffix: '-min'
		}),
		uglify({
			compress: {
				drop_console: true
			},
			preserveComments: 'some'
		})
	);
};
