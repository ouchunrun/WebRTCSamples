let gulp = require('gulp');
let gutil = require('gulp-util');
let concat = require('gulp-concat');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify-es').default;

let releaseList = [
    './src/event-target-shim.js',
    './src/detect-browser.js',
    './src/OggOpusMediaRecorder.js',
    './src/api.js'
]

gulp.task('build', function (done) {
    gulp.src(releaseList)
        .pipe(concat('OggOpusRecorder.js'))         // 按照[]里的顺序合并文件
        .pipe(sourcemaps.init())
        .pipe(uglify({
            warnings: true,
            mangle: true,
            compress: true,
        }))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(sourcemaps.write()) // Inline source maps.
        .pipe(gulp.dest('./dist'))
    done();
})

gulp.task('default', gulp.series('build', function(done) {
    console.log( "gulp default task" );
    done();
}));