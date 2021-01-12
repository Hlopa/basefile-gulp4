
const {src, dest, watch, parallel, series} = require("gulp"),
    scss = require("gulp-sass"),
    concat = require("gulp-concat"),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify-es').default,
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    del = require("del");


function browsersync(){
    browserSync.init({
        server:{baseDir: "app/"},
        notify: false,      //отключает всплывающее уведомление в браузере
        online: true    //раздает IP адреса, но не может работать без интернета. Для офлайн режима пишем false
    })
}

function style(){
    return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'})) //expanded //конвертирует в css и сжимает
    .pipe(concat('style.min.css'))  //может конкатенировать и переименовывать файлы
    .pipe(autoprefixer({
        overrideBrowserslist: ["last 8 version"], //10
        grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}


function js(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images(){
    return src('app/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 85, progressive: true}),
        imagemin.optipng({optimizationLevel: 3}), // от 0 до 7
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}


function build(){
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html',

    ], {base: 'app'})  //чтобы в дист были такие же папки
    .pipe(dest('dist'))
}

function cleanDist(){
    return del('dist')
}


function watching(){
    watch(['app/scss/**/*.scss'], style) //следит за файлами и запускает style если засекает изменения
    watch(['app/js/**/*.js', '!app/**/*.min.js'], js)
    watch(['app/*.html']).on('change', browserSync.reload)
}


exports.style = style;
exports.js = js;
exports.images = images;
exports.watching = watching;
exports.browsersync = browsersync;
exports.cleanDist = cleanDist;


exports.default = parallel(browsersync, watching); //задаем дефолтную задачу для gulp
exports.build = series(cleanDist, images, build);