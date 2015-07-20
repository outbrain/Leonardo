var gulp = require('gulp'),
  path = require('path'),
  runSequence = require('run-sequence'),
  less = require('gulp-less'),
  rename = require("gulp-rename"),
  minifyCSS = require('gulp-minify-css'),
  minifyHtml = require("gulp-minify-html"),
  ngHtml2Js = require("gulp-ng-html2js"),
  concat = require('gulp-concat');

require("gulp-help")(gulp);

gulp.task('copy', function() {
  return gulp.src([
      "./bower_components/angular/angular.min.js",
      "./bower_components/angular-mocks/angular-mocks.js",
      "./index.js"
  ])
  .pipe(gulp.dest('./docs/public/leonardo'));
});

gulp.task("build-less", false, function () {
    return gulp.src("./src/leonardo/style/app.less")
      .pipe(less())
      .on('error', function (err) {
        console.log(err.message);
      })
      .pipe(rename('leonardo.min.css'))
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
    .pipe(gulp.dest('./docs/public/leonardo'));
});
gulp.task('build-js', function(){
  return gulp.src(
      [
        './src/leonardo/module.js',
        './src/leonardo/configuration.srv.js',
        './src/leonardo/storage.srv.js',
        './src/leonardo/activator.drv.js',
        './src/leonardo/window-body.drv.js',
        './docs/public/leonardo/leonardo.templates.min.js'
      ])
      .pipe(concat('leonardo.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(gulp.dest('./docs/public/leonardo'));
});

gulp.task('build', function(cb) {
  runSequence(
    ['build-less', 'build-templates', 'build-js'],
    'copy',
    cb);
});

gulp.task('watch', "Watch file changes and auto compile for development", ['build'], function () {
  gulp.watch(["./src/leonardo/style/*.less"], ['build-less']);
  gulp.watch(["./src/leonardo/*.js"], ['build-js']);
  gulp.watch(["./src/leonardo/templates/*.html"], ['build-templates','build-js']);
});


gulp.task('default', ['build']);
