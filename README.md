# Metal Tasks

[![Build Status](https://img.shields.io/travis/metal/gulp-metal/master.svg?style=flat)](https://travis-ci.org/metal/gulp-metal)

Gulp pipelines and tasks to be shared between Metal components.

## Usage
This is a collection of tasks to be used by Metal components. To use them, just install this through [npm](https://www.npmjs.com/package/gulp-metal) and register the tasks on your gulpfile like this:

```js

var metal = require('gulp-metal');
metal.registerTasks(options);
```

As you can see, the metal function receives an optional object to customize the registered functions. Each task has its own options, but the `taskPrefix` option affects all task, registering them all with the provided prefix before the original names.

After calling the metal function, several tasks will then be available to run on gulp. These can be broken in different categories, so we'll explain each separately.

### Build Tasks

As we've mentioned before, Metal.js is written in ES6. Since browsers don't yet implement ES6, the original code won't run on them. There are several different ways to solve this, such as adding a ES6 polyfill like [traceur](https://github.com/google/traceur-compiler). That means adding more code to the page though, as well as compiling the code at run time.

Another option is to previously build the ES6 files to ES5 equivalents. Again, there are lots of ways to do this, and lots of formats to build to. Metal.js provides a few tasks as build options that can be used out of the box.

#### `gulp build`
Builds your project's files: css, soy and js (from ES6 code to ES5 for example). The following options can be passed to the metal function for customizing this task:
* `buildDest` The directory where the built files should be placed. Default: **build**.
* `bundleFileName` The name of the final bundle file. Only used for output formats that bundle all compiled code into a single file, like when building to globals. Default: **metal.js**.
* `buildSrc` The glob expression that defines which js files should be built. Default: **src/\*\*/\*.js**.
* `globalName` The name of the global variable that should hold the exported values of the modules. Only used if the globals output format is being used. Default: **metal**.
* `mainBuildJsTasks` The tasks that should be run for building js. That's how you can choose the output format of the compiled js code. Default: **build:globals:js**.

#### `gulp watch`
Watches for changes on the source files, rebuilding the code to the chosen format automatically when that happens.

### Test Tasks

Metal.js also provides gulp tasks to help with testing modules built with Metal.js. The tasks assume that tests are written in [karma](http://karma-runner.github.io/0.12/index.html), and so there should be a **karma.conf.js** file. A sample karma.conf.js file can be found at [generator-metal](https://github.com/metal/generator-metal/tree/master/app/templates), which works well with Metal.js, including correct coverage reports.

#### `gulp test`
Runs all tests once.

#### `gulp test:coverage`
Runs all tests once and shows coverage information on the terminal.

#### `gulp test:coverage:open`
Runs all tests once and then opens the coverage html file on the default browser.

#### `gulp test:browsers`
Runs all tests once on the following browsers: Chrome, Firefox, Safari, IE9, IE10 and IE11.

#### `gulp test:saucelabs`
Runs all tests once on Saucelabs. Both username and access key need to be previously specified as environemnt variables for this to work. See [karma-sauce-launcher](https://github.com/karma-runner/karma-sauce-launcher) for more details.

#### `gulp test:watch`
Watches for changes to source files, rerunning tests automatically when that happens.

### Soy Tasks

Finally, Metal.js provides an important task for developing with SoyComponent. If your code is using it, you'll need this task for the templates to be correctly handled and integrated with your javascript file.

#### `gulp soy`
Generates some soy templates that are necessary for integration with the SoyComponent module, and compiles them to javascript. The following options can be passed to the metal function for customizing this task:

* `corePathFromSoy` The path from the soy files location to Metal.js's core module. Default: **metal/src**.
* `soyDest` The directory where the compiled soy files should be placed. Default: **src**.
* `soyGeneratedDest` The directory that should hold the generated soy files. Default **build**.
* `soySrc` The glob expression that defines the location of the soy files. Default: **src/\*\*/\*.soy**.
