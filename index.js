'use strict';

var build = require('metal-tools-build-globals/lib/pipelines/buildGlobals');
var registerTasks = require('./lib/tasks/index');

module.exports.registerTasks = registerTasks;

module.exports.build = build;
