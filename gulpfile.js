'use strict';

var gulp = require('gulp'),
  path = require('path'),
  webserver = require('gulp-webserver'),
  del = require('del'),
  runSequence = require('run-sequence'),
  less = require('gulp-less'),
  rename = require("gulp-rename"),
  minifyCSS = require('gulp-minify-css'),
  minifyHtml = require("gulp-minify-html"),
  ngHtml2Js = require("gulp-ng-html2js"),
  concat = require('gulp-concat'),
  ts = require('gulp-typescript'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserify = require('browserify'),
  tsify = require('tsify'),
  watchify = require('watchify'),
  css2js = require("gulp-css2js");

require("gulp-help")(gulp);

gulp.task('clean:tmp', function() {
  del(['tmp/**/*']);
});

gulp.task('clean:dist', function() {
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

gulp.task("build:templates", false, function () {
  return gulp.src("./src/leonardo/templates/*.html")
      .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe(ngHtml2Js({
        moduleName: 'leonardo.templates'
      }))
      .pipe(concat('leonardo.templates.min.js'))
      .pipe(gulp.dest('./tmp'));
});

gulp.task('build:js', function(){
  return gulp.src(
      [
        './src/leonardo/sinon.js',
        './tmp/leonardo-ts.js',
        './src/leonardo/separator.js',
        './tmp/leonardo.templates.min.js',
        './tmp/leonardo.css.js'
      ])
      .pipe(concat('leonardo.js'))
      .pipe(gulp.dest('./tmp'));
});

gulp.task('copy:dist', function() {
  return gulp.src([
    "./tmp/leonardo.js"
  ])
  .pipe(gulp.dest('./dist'))
});

gulp.task('build', function(cb) {
  runSequence(
    'build:less',
    'build:templates',
    'build:scripts',
    'build:js',
    'clean:dist',
    'copy:dist',
    'clean:tmp',
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


gulp.task('serve', "Serve files after build and watch", ['build', 'watch'], function () {
  gulp.src('')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html',
      middleware: mockServerMiddleware('/')
    }));
});

gulp.task('watch', "Watch file changes and auto compile for development", ['build'], function () {
  gulp.watch(["index.html", "./src/leonardo/**/*"], ['build']);
});


//gulp.task('build:scripts', 'transpile es whatever to es5', function () {
//  let tsProject = ts.createProject('tsconfig.json');
//
//  let tsResult = gulp.src('src/leonardo/leonardo.ts')
//    .pipe(ts(tsProject));
//
//  return tsResult.js
//    .pipe(gulp.dest('./dist'));
//});

gulp.task('build:scripts', 'transpile es whatever to es5', function () {
  return typescript('./src/leonardo/', 'leonardo.ts', false);
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
