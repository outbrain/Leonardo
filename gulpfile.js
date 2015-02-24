var gulp = require('gulp'),
  path = require('path'),
  runSequence = require('run-sequence'),
  gulpTraceurCmdline = require('gulp-traceur-cmdline'),
  less = require('gulp-less'),
  rename = require("gulp-rename"),
  minifyCSS = require('gulp-minify-css'),
  minifyHtml = require("gulp-minify-html"),
  ngHtml2Js = require("gulp-ng-html2js");

require("gulp-help")(gulp);

gulp.task('transpile', 'Transpile the App from ES6 to ES5', function() {

  var distPath = path.join('dist', 'module.js');

  return gulp.src(path.join('src', 'leonardo',  'module.js'))
    .pipe(gulpTraceurCmdline({
      'source-maps': 'inline',
      symbols : true,
      modules : 'register',
      out     : distPath,
      debug   : false
    }))
    .on('error', function (err) {
      console.log(err.message);
    });
});


gulp.task('transpile-example', 'Transpile the App from ES6 to ES5', function() {

  var distPath = path.join('docs', 'public', 'leonardo',  'index.js');

  return gulp.src(path.join('index.js'))
    .pipe(gulpTraceurCmdline({
      'source-maps': 'inline',
      symbols : true,
      modules : 'register',
      out     : distPath,
      debug   : false
    }))
    .on('error', function (err) {
      console.log(err.message);
    });
});

gulp.task('copy', function() {
  return gulp.src([
      "./dist/module.js",
      "./bower_components/traceur-runtime/traceur-runtime.min.js",
      "./bower_components/angular/angular.min.js",
      "./bower_components/angular-mocks/angular-mocks.js"

  ])
    .pipe(gulp.dest('./docs/public/leonardo'));
});

gulp.task("build-less", false, function () {
    return gulp.src("./src/leonardo/style/app.less")
      .pipe(less())
      .on('error', function (err) {
        console.log(err.message);
      })
      .pipe(rename('app.min.css'))
      .pipe(minifyCSS({
        keepSpecialComments: 0
      }))
      .pipe(gulp.dest('./dist'))
      .pipe(gulp.dest('./docs/public/leonardo'));
});

gulp.task("build-templates", false, function () {
  return gulp.src("./src/leonardo/templates/*.html")
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(ngHtml2Js({
      moduleName: 'leonardo.templates'
    }))
    .pipe(rename('leonardo.templates.min.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./docs/public/leonardo'));
});

gulp.task('watch', "Watch file changes and auto compile for development", function () {
//  gulp.watch(["./src/leonardo/*.js", "./src/leonardo/templates/*.html", "./src/leonardo/style/*.less"], ['default']);
  gulp.watch(["./src/leonardo/style/*.less"], ['build-less']);
  gulp.watch(["./src/leonardo/*.js"], ['transpile']);
});

gulp.task('default', ['transpile', 'build-less', 'build-templates', 'transpile-example'], function(cb) {
  runSequence(['copy'], cb);
});