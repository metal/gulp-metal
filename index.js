'use strict';

var build = require('./lib/build');
var soy = require('./lib/soy');
var registerTasks = require('./lib/tasks/index');
var renameAlias = require('./lib/renameAlias');

module.exports.registerTasks = registerTasks;
module.exports.renameAlias = renameAlias;

module.exports.build = build;
module.exports.soy = soy;
