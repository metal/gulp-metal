'use strict';

var build = require('./lib/pipelines/build');
var soy = require('./lib/pipelines/soy');
var registerTasks = require('./lib/tasks/index');

module.exports.registerTasks = registerTasks;

module.exports.build = build;
module.exports.soy = soy;
