var gulp = require('gulp'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    ngHtml2js = require('gulp-ng-html2js'),
    htmlmin = require('gulp-htmlmin'),
    merge = require('merge-stream'),
    minifyCSS = require('gulp-minify-css');

var processTemplate = function(){
  return gulp.src('src/templates/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(ngHtml2js({
      moduleName: "stateRouterScenario.templates",
      prefix: "templates/"
    }));
}

gulp.task('less', function () {
  gulp.src('./src/style/srs.less')
    .pipe(less())
    .pipe(gulp.dest('./dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/'))
});

gulp.task('process-scripts', function() {
  var scripts = gulp.src('src/scripts/**/*.js');
  var templates = processTemplate();

  scripts
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/'))

  templates
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));

  merge(scripts, templates)
    .pipe(concat('main.templates.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('default', ['less', 'process-scripts']);