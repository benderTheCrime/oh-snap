(function() {
    'use strict';

    var gulp =      require('gulp'),
        jshint =    require('gulp-jshint'),
        jscs =      require('gulp-jscs'),
        jsdoc =     require('gulp-jsdoc');

    var src = 'lib/js/',
        docSrc = 'doc';

    gulp.task('jshint', function() {
        return gulp.src(src + '**')
            .pipe(jshint())
            .pipe(jshint.reporter('default', { verbose: true }));
    });
    gulp.task('jscs', [ 'jshint' ], function() {
        gulp.src(src + '**').pipe(jscs());
    });
    gulp.task('jsdoc', function() {
        gulp.src([ src + '**', 'README.md' ]).pipe(jsdoc('./' + docSrc));
    });

    gulp.task('debug', [ 'jscs', 'jsdoc' ]);
    gulp.task('watch', function() {
        gulp.watch(src + '**', [ 'debug' ]);
    });
    gulp.task('default', [ 'debug', 'watch' ]);

    module.exports = function(cb) {
        return gulp.start('debug', function() {
            return cb();
        });
    };
})();
