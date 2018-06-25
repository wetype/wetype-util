import _ = require('lodash')
import { rewrite } from './build/gulp-rewrite'
import { compileTpl } from './build/gulp-compile-tpl'
import { writeJson } from './build/gulp-write-json'
import { copyModules } from './build/gulp-copy-modules'
import { modifyWxml } from './build/gulp-modify-wxml'
import { modifyWxss } from './build/gulp-modify-wxss'
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const flatten = require('gulp-flatten')
const uglify = require('gulp-uglify')
const cache = require('gulp-cached')
const fs = require('fs')
const imagemin = require('gulp-imagemin')
const plumber = require('gulp-plumber')
const prettier = require('prettier')
const sass = require('gulp-sass')
const uglifycss = require('gulp-uglifycss')

export const gulpfile = (gulp, pkgJsons) => {
    gulp.task('ts', () => {
        return tsProject
            .src()
            .pipe(plumber())
            .pipe(cache('ts'))
            .pipe(tsProject())
            .js.pipe(rewrite())
            .pipe(writeJson())
            .pipe(gulp.dest('dist'))
    })

    gulp.task('pug', () => {
        gulp
            .src('src/**/*.pug')
            .pipe(plumber())
            .pipe(pug())
            .pipe(
                rename({
                    extname: '.wxml'
                })
            )
            .pipe(modifyWxml())
            .pipe(compileTpl())
            .pipe(gulp.dest('dist'))
    })

    gulp.task('sass', cb => {
        return gulp
            .src('src/**/*.scss')
            .pipe(sass())
            .on('error', function(this, err) {
                console.log(err.toString())
                this.emit('end')
            })
            .pipe(rename({ extname: '.wxss' }))
            .pipe(modifyWxss())
            .pipe(gulp.dest('dist'))
    })

    gulp.task('copy', () => {
        gulp
            .src(pkgJsons)
            .pipe(copyModules())
            .pipe(flatten())
            .pipe(gulp.dest('./dist/modules'))
    })

    gulp.task('img', () => {
        gulp
            .src(['src/img/**/*', '!src/img/**/icon-*'])
            .pipe(imagemin())
            .pipe(gulp.dest('dist/img'))
    })

    gulp.task('uglify', ['ts', 'copy'], () => {
        gulp
            .src('dist/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
    })

    gulp.task('uglifycss', ['sass'], () => {
        gulp
            .src('dist/**/*.wxss')
            .pipe(uglifycss())
            .pipe(gulp.dest('dist'))
    })

    gulp.task('copyWxs', () => {
        gulp
            .src('src/wxs/**/*.js')
            .pipe(
                rename({
                    extname: '.wxs'
                })
            )
            .pipe(gulp.dest('dist/wxs'))
    })

    gulp.task('w', () => {
        const tsWatcher = gulp.watch('src/**/*.ts', ['ts'])
        const pugWatcher = gulp.watch('src/**/*.pug', ['pug'])
        const sassWatcher = gulp.watch('src/**/*.scss', ['sass'])
        const imgWatcher = gulp.watch('src/img/*', ['img'])
        const wxsWatcher = gulp.watch('src/wxs/**/*.js', ['copyWxs'])

        tsWatcher.on('change', e => {
            console.log(
                'File ' + e.path + ' was ' + e.type + ', running tasks...'
            )
        })
    })

    gulp.task('default', ['ts', 'pug', 'sass', 'copy', 'img', 'copyWxs', 'w'])

    gulp.task('build', ['uglify', 'pug', 'uglifycss', 'img', 'copyWxs', 'w'])
}
