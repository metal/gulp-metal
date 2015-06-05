var gulp = require('gulp');
var execFile = require('child_process').execFile;
var path = require('path');

gulp.task('test:tasks', function(done) {
	// Mocha is being run as a separate process, because we need its gulp instance
	// to be different from the gulp instance being used for this task. That's
	// necessary for testing gulp tasks.
	var args = ['test/*.js', 'test/lib/*.js', '-c', '--slow', '1000', '--timeout', '3000'];
	var localMocha = path.join(process.cwd(), 'node_modules', '.bin', 'mocha');
	var options = {
		stdio: 'inherit'
	};
	var child = execFile(localMocha, args, options, function() {
		done();
	});
	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);
});
