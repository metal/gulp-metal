'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../../lib/tasks/index');
var sinon = require('sinon');

describe('CSS Task', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.resolve(__dirname, '../../assets'));
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should concatenate css and compiled scss files into a single bundle', function(done) {
		registerTasks();

		gulp.start('css', function() {
			var contents = fs.readFileSync('build/all.css', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('.foo'));
			assert.notStrictEqual(-1, contents.indexOf('.sass'));
			done();
		});
	});

	it('should use task prefix when it\'s defined', function(done) {
		registerTasks({
			taskPrefix: 'myPrefix:'
		});

		gulp.start('myPrefix:css', function() {
			var contents = fs.readFileSync('build/all.css', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('.foo'));
			assert.notStrictEqual(-1, contents.indexOf('.sass'));
			done();
		});
	});

	it('should get css and sass files from requested src', function(done) {
		registerTasks({
			cssSrc: 'css/anotherPath.css',
			scssSrc: 'css/anotherPath.scss'
		});

		gulp.start('css', function() {
			var contents = fs.readFileSync('build/all.css', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('.anotherPathCss'));
			assert.notStrictEqual(-1, contents.indexOf('.anotherPathSass'));
			done();
		});
	});

	it('should use sass include paths indicated by the scssIncludePaths option', function(done) {
		registerTasks({
			scssIncludePaths: ['css'],
			scssSrc: 'css/importer.scss'
		});

		gulp.start('css', function() {
			var contents = fs.readFileSync('build/all.css', 'utf8');
			assert.notStrictEqual(-1, contents.indexOf('.importer'));
			assert.notStrictEqual(-1, contents.indexOf('.anotherPathSass'));
			done();
		});
	});

	it('should trigger "end" event even when task throws error for invalid sass file', function(done) {
		registerTasks({
			scssSrc: 'css/invalid/invalid.scss'
		});
		sinon.stub(console, 'error');

		gulp.start('css', function() {
			assert.strictEqual(1, console.error.callCount);
			console.error.restore();
			done();
		});
	});
});
