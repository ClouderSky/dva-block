
const gulp = require('gulp');
const ts = require('gulp-typescript');
const minify = require('gulp-minify');
const tsProject = ts.createProject('tsconfig.json');


gulp.task('default', function () {
    gulp.src('./src/*.d.ts').pipe(gulp.dest('.'));

    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js
        .pipe(minify({ noSource : true, ext : { min : [
            /^(.*)\.(js|jsx|ts|tsx)$/, '$1.js',
        ] } }))
        .pipe(gulp.dest('lib'));
});
