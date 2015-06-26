'use strict';

function handleError(error) {
	console.error(error.toString());

	this.emit('end'); // jshint ignore:line
}

module.exports = handleError;
