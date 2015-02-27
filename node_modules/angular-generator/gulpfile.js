var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  generator = require('./lib'),
  log = require('./lib/log');

gulp.task('jshint', function () {
  return gulp.src(['lib/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('mocha', function () {
  process.env.NODE_ENV = 'test';
  return gulp.src(['test/**/*.js'])
    .pipe(mocha({reporter:'spec'}));
});

gulp.task('test', ['jshint', 'mocha']);

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('generate', generator.generate);

gulp.task('default', ['test', 'watch']);