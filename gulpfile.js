var gulp = require('gulp'),
  Dgeni = require('dgeni'),
  path = require('path'),
  gulpTraceurCmdline = require('gulp-traceur-cmdline');

require("gulp-help")(gulp);

gulp.task('transpile', 'Transpile the App from ES6 to ES5', function() {

  var distPath = path.join( 'dist', 'module.js');

  return gulp.src(path.join('src', 'module.js'))
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


gulp.task('dgeni', function() {
  var dgeni = new Dgeni([require('./docs/dgeni')]);
  return dgeni.generate();
});

gulp.task('default', ['transpile']);