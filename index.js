'use strict';

var build = require('./lib/pipelines/build');
var registerTasks = require('./lib/tasks/index');

module.exports.registerTasks = registerTasks;

module.exports.build = build;
