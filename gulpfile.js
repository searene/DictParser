var gulp = require("gulp");
var ts = require("gulp-typescript");
var del = require("del");
var sequence = require("run-sequence");

var tsProject = ts.createProject('tsconfig.json')

gulp.task("compile", function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest("lib"));
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