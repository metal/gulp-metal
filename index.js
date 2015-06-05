'use strict';

var build = require('./lib/build');
var soy = require('./lib/soy');
var registerTasks = require('./lib/tasks/index');

module.exports.registerTasks = registerTasks;

module.exports.build = build;
module.exports.soy = soy;
