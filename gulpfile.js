const { src, dest, watch, parallel, series } = require("gulp"),
    scss = require("gulp-sass"),
    cssmin = require('gulp-cssmin'),
    concat = require("gulp-concat"),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify-es').default,
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    del = require("del");


function browsersync() {
    browserSync.init({
        server: { baseDir: "app/" },
        notify: false,      //отключает всплывающее уведомление в браузере
        online: true    //раздает IP адреса, но не может работать без интернета. Для офлайн режима пишем false
    })
}

function style() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'expanded' })) //compressed //конвертирует в css и сжимает
        .pipe(concat('style.min.css'))  //может конкатенировать и переименовывать файлы
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 10 version"], //10
            grid: true
        }))
        .pipe(cssmin())
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}


function stylelib() {
    return src([
        "node_modules/normalize.css/normalize.css",
        "node_modules/slick-carousel/slick/slick.css",
        "node_modules/animate.css/animate.css",
    ])
        .pipe(concat("libs.min.css"))
        .pipe(cssmin())
        .pipe(dest("app/css"))
}


function js() {
    return src([
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function jslib() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        "node_modules/slick-carousel/slick/slick.js"
    ])
        .pipe(concat('lib.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function images() {
    return src('app/images/**/*')
        .pipe(webp({
            quality: 80
        }))
        .pipe(dest('dist/images'))
        .pipe(src('app/images/**/*'))
        .pipe(imagemin())
        .pipe(dest('dist/images'))
}


function buildhtml() {
    return src('app/*.html')
        .pipe(webphtml())
        .pipe(dest('dist'))
}

function build() {
    return src([
        'app/css/libs.min.css',
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/lib.min.js',
        'app/js/main.min.js',
    ], { base: 'app' })  //чтобы в дист были такие же папки
        .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}


function watching() {
    watch(['app/scss/**/*.scss'], style) //следит за файлами и запускает style если засекает изменения
    watch(['app/js/**/*.js', '!app/**/*.min.js'], js)
    watch(['app/*.html']).on('change', browserSync.reload)
}


exports.buildhtml = buildhtml;
exports.style = style;
exports.stylelib = stylelib;
exports.js = js;
exports.jslib = jslib;
exports.images = images;
exports.watching = watching;
exports.browsersync = browsersync;
exports.cleanDist = cleanDist;


exports.default = parallel(stylelib, style, jslib, js, browsersync, watching); //задаем дефолтную задачу для gulp
exports.build = series(cleanDist, images, build, buildhtml);