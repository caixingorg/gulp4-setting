var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'), // html 压缩
    sass = require('gulp-ruby-sass'), //sass编译
    autoprefixer = require('gulp-autoprefixer'), //css前缀补全
    minifyCss = require('gulp-minify-css'), //css压缩

    cache = require('gulp-cache'), //处理图片缓存
    imagemin = require('gulp-imagemin'), //图片压缩
    webpack = require('gulp-webpack'), //webpack CommonJS
    uglify = require('gulp-uglify'), //压缩混淆js

    del = require('del'), //删除文件
    rev = require('gulp-rev'), //文件求MD5
    revCollector = require('gulp-rev-collector'), //MD5路径替换
    del = require('del'), //删除文件
    livereload = require('gulp-livereload'); //自动刷新

var options = {

        enterPath: {
            images: ['src/images/**/*'],
            css: 'src/sass/*.scss',
            html: ['src/*.html'],
            js: ['src/js/*.js'],
            commonjs: ['src/commonjs/*.js'],
            webpack: {
                index: './src/commonjs/index.js'
            }
        },

        outPath: {
            images: 'dist/iamges/',
            css: 'dist/css/',
            html: 'dist/',
            js: 'dist/js/'
        },

        html: {
            removeComments: true, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
            collapseBooleanAttributes: true, //省略布尔属性的值
            removeEmptyAttributes: true, //删除所有空格作属性值
            removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
            minifyJS: true, //压缩页面JS
            minifyCSS: true //压缩页面CSS
        }
    }
    //删除文件
function clean(cb) {
    return del(['dist'], cb);
}

function images() {
    return gulp.src(options.enterPath.images)
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(livereload());
}

function css() {
    return sass(options.enterPath.css, {
            sourcemap: true
        })
        .on('error', sass.logError)
        .pipe(autoprefixer('last 9 versions', 'IE > 11', 'Firefox ESR', 'ios 5', 'android 2')) //css前缀自动补全
        .pipe(minifyCss()) //压缩混淆css
        .pipe(gulp.dest(options.outPath.css))
        .pipe(livereload());
}

function js() {
    return gulp.src(options.enterPath.js)
        .pipe(concat('lib.js'))
        .pipe(uglify())
        .pipe(gulp.dest(options.outPath.js))
        .pipe(livereload());
}

function commonjs() {
    return gulp.src(options.enterPath.commonjs)
        .pipe(webpack({
            entry: options.enterPath.webpack,
            output: {
                filename: '[name].js',
            },
        }))
        .pipe(uglify())
        .pipe(gulp.dest(options.outPath.js))
        .pipe(livereload());
}

function html() {
    return gulp.src(options.enterPath.html)
        .pipe(htmlmin(options))
        .pipe(revCollector())
        .pipe(gulp.dest(options.outPath.html))
        .pipe(livereload());
}

function watch() {
    livereload.listen();

    gulp.watch(options.enterPath.images, images);
    gulp.watch(options.enterPath.css, css);
    gulp.watch(options.enterPath.js, js);
    gulp.watch(options.enterPath.commonjs, commonjs);
    gulp.watch(options.enterPath.html, html);
}

gulp.task('build', gulp.series(
    clean,
    images,
    css,
    js,
    commonjs,
    html,
    watch
));

gulp.task('default', gulp.series('build'));
