var gulp = require('gulp');
var sync = require('browser-sync').create();

gulp.task('default', function () {
  sync.init({
    server: {
      baseDir: './',
      index: 'index.html'
    },
    browser: [ 'FirefoxDeveloperEdition' ],
    files: '*.*'
  });
});
