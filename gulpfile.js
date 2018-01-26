var gulp = require("gulp");
var ts = require("gulp-typescript");
var del = require("del");
var sequence = require("run-sequence");
var sourcemaps = require('gulp-sourcemaps');
var tsProject = ts.createProject('tsconfig.json');
var path = require("path");

gulp.task("compile", function () {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult
        .pipe(sourcemaps.write({
            // Return relative source map root directories per file.
            sourceRoot: function (file) {
                var sourceFile = path.join(file.cwd, file.sourceMap.file);
                return path.relative(path.dirname(sourceFile), file.cwd);
            }}))
        .pipe(gulp.dest("lib"));
});

gulp.task("clean", function() {
    return del(['lib']);
});

gulp.task("copy-resources", function() {
    return gulp.src(['src/**/!(*.ts)'])
               .pipe(gulp.dest('lib'));
});

gulp.task("default", function(done) {
    sequence('clean', 'compile', 'copy-resources', done);
});
