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
const clean = require('gulp-clean')
const flatten = require('gulp-flatten')
const uglify = require('gulp-uglify')
const cache = require('gulp-cached')
const fs = require('fs')
const imagemin = require('gulp-imagemin')
const plumber = require('gulp-plumber')
const prettier = require('prettier')
const sass = require('gulp-sass')

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

    // gulp.task('less', cb => {
    //     console.log('123345')
    //     return (
    //         gulp
    //             .src('src/**/*.less')
    //             // .pipe(plumber())
    //             .pipe(less())
    //         // .pipe(
    //         //     rename({
    //         //         extname: '.wxss'
    //         //     })
    //         // )
    //         // .pipe(modifyWxss())
    //     )
    //     // .pipe(gulp.dest('dist'))
    // })

    gulp.task('sass', cb => {
        return gulp
            .src('src/**/*.scss')
            .pipe(sass())
            .pipe(
                rename({
                    extname: '.wxss'
                })
            )
            .pipe(gulp.dest('dist'))
    })

    gulp.task('clean', () => {
        return gulp
            .src('dist', {
                read: false
            })
            .pipe(clean())
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
            .src('src/img/*')
            .pipe(imagemin())
            .pipe(gulp.dest('dist/img'))
    })

    gulp.task('uglify', () => {
        gulp
            .src('dist/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
    })

    // gulp.task('rmExtraCss', () => {})

    gulp.task('w', () => {
        const tsWatcher = gulp.watch('src/**/*.ts', ['ts'])
        const pugWatcher = gulp.watch('src/**/*.pug', ['pug'])
        const sassWatcher = gulp.watch('src/**/*.scss', ['sass'])
        const imgWatcher = gulp.watch('src/img/*', ['img'])

        tsWatcher.on('change', e => {
            console.log(
                'File ' + e.path + ' was ' + e.type + ', running tasks...'
            )
        })
    })

    gulp.task('default', ['ts', 'pug', 'sass', 'copy', 'img', 'w'])
}
