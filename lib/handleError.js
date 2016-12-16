'use strict';

var gutil = require('gulp-util');

function handleError(error, source) {
	var message = error.messageFormatted ? error.messageFormatted : error.message;
	source = source || error.plugin;
	console.error(new gutil.PluginError(source || 'metal', message).toString());

	this.emit('end'); // eslint-disable-line
}

module.exports = handleError;
