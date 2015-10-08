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
  concat = require('gulp-concat');

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
      .pipe(rename('leonardo.min.css'))
      .pipe(minifyCSS({
        keepSpecialComments: 0
      }))
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
      .pipe(rename('leonardo.templates.min.js'))
      .pipe(gulp.dest('./tmp'));
});

gulp.task('build:js', function(){
  return gulp.src(
      [
        './src/leonardo/module.js',
        './src/leonardo/configuration.srv.js',
        './src/leonardo/httpInterceptor.srv.js',
        './src/leonardo/storage.srv.js',
        './src/leonardo/activator.drv.js',
        './src/leonardo/window-body.drv.js',
        './tmp/leonardo.templates.min.js'
      ])
      .pipe(concat('leonardo.js'))
      .pipe(gulp.dest('./tmp'));
});

gulp.task('copy:dist', function() {
  return gulp.src([
    "./tmp/leonardo.js",
    "./tmp/leonardo.min.css"
  ])
  .pipe(gulp.dest('./dist'));
});

gulp.task('build', function(cb) {
  runSequence(
    'build:less',
    'build:templates',
    'build:js',
    'clean:dist',
    'copy:dist',
    'clean:tmp',
    cb);
});

gulp.task('serve', "Serve files after build and watch", ['build', 'watch'], function () {
  gulp.src('')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('watch', "Watch file changes and auto compile for development", ['build'], function () {
  gulp.watch(["index.html", "./src/leonardo/**/*"], ['build']);
});

gulp.task("default", "Runs help task", ["help"], function() {});
