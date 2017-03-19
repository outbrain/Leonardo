'use strict';

var gulp = require('gulp'),
  path = require('path'),
  webserver = require('gulp-webserver'),
  del = require('del'),
  runSequence = require('run-sequence'),
  less = require('gulp-less'),
  rename = require("gulp-rename"),
  concat = require('gulp-concat'),
  ts = require('gulp-typescript'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserify = require('browserify'),
  tsify = require('tsify'),
  watchify = require('watchify'),
  css2js = require("gulp-css2js"),
  Server = require('karma').Server;

require("gulp-help")(gulp);

gulp.task('clean:tmp', false, function() {
  del(['tmp/**/*']);
});

gulp.task('clean:dist', false, function() {
  del(['dist/**/*']);
});

gulp.task("build:less", false, function () {
  return gulp.src("./src/leonardo/style/app.less")
      .pipe(less())
      .on('error', function (err) {
        console.log(err.message);
      })
      .pipe(css2js())
      .pipe(rename('leonardo.css.js'))
      .pipe(gulp.dest('./tmp'));
});

gulp.task('copy:dist', false, function() {
  return gulp.src([
    "./tmp/leonardo.js"
  ])
  .pipe(gulp.dest('./dist'))
});

gulp.task('build', "build all from scratch", function(cb) {
  runSequence(
    'clean:dist',
    'clean:tmp',
    'build:less',
    'build:scripts',
    'build:js',
    'copy:dist',
    cb);
});

gulp.task('build:partial', "build without typescript", function(cb) {
  runSequence(
    'clean:dist',
    'clean:tmp',
    'build:less',
    'build:js',
    'copy:dist',
    cb);
});

gulp.task('build:less:full', "build less", function(cb) {
  runSequence(
    'build:less',
    'build:js',
    'copy:dist',
    cb);
});

gulp.task('build:ts', "build typescript", function(cb) {
  runSequence(
    'build:js',
    'copy:dist',
    cb);
});


function mockServerMiddleware(route) {
  return function (req, res, next) {
    if (req.url === '/' || req.url.length > 15) {
      return next();
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    return res.end();
  };
}


gulp.task('serve', "Serve files after build and watch", function () {
  gulp.src('')
    .pipe(webserver({
      livereload: {
        enable: true,
        filter: function(fileName) {
          return !!fileName.match(/dist/);
        }
      },
      open: true,
      fallback: 'index.html',
      middleware: mockServerMiddleware('/')
    }));
});

gulp.task('watch', "Watch file changes and auto compile for development", ['build:scripts:watch-incremental'], function () {
  gulp.watch(["./src/leonardo/**/*.less"], ['build:less:full']);
  gulp.watch(["./tmp/leonardo-ts.js"], ['build:ts']);
  gulp.watch(["index.html"], ['build']);
});

gulp.task('test', "run unit tests", [], function (done) {
  return new Server({
    configFile: __dirname + '/test/unit/karma.conf.js'
  }, function() {done();}).start();
});


gulp.task('build:scripts', 'transpile es whatever to es5', function () {
  return typescript('./src/leonardo/', 'leonardo.ts', false);
});

gulp.task('build:scripts:watch-incremental', 'transpile es whatever to es5 with ts incremental build', function () {
  return typescript('./src/leonardo/', 'leonardo.ts', true);
});

gulp.task("default", "Runs help task", ["help"], function() {});

function typescript(sourceFolder, sourceFile, watch) {
  let taskConfig = {
    client: {
      outDir: path.join('tmp'),
      out: 'leonardo-ts.js',
      options: {
        browserify: {
          entries: path.join(sourceFolder, sourceFile),
          extensions: ['.ts'],
          debug: true
        },
        tsify: {
          "target": "ES5",
          "removeComments": true,
          "noImplicitAny": false
        }
      }
    }
  };

  let opts = Object.assign({}, watchify.args, taskConfig.client.options.browserify);
  let b = browserify(opts);
  if (watch) {
    b = watchify(b);
  }

  b.plugin(tsify, taskConfig.client.options.tsify);
  b.on('update', bundle); // on any dep update, runs the bundler
  b.on('log', console.log); // output build logs to terminal

  function bundle() {
    return b.bundle()
      .on('error', console.log.bind(console.log, 'Browserify Error'))
      .pipe(source(taskConfig.client.out))
      .pipe(buffer())
      .pipe(gulp.dest(taskConfig.client.outDir));
  }

  return bundle();
}
