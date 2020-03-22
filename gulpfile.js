
const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const contentIncluder = require('gulp-content-includer')
const less = require('gulp-less')
const autoprefixer = require('gulp-autoprefixer')
const cssMin = require('gulp-clean-css')
const eslint = require('gulp-eslint')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const plumber = require('gulp-plumber')
const del = require('del')
const browserSync = require('browser-sync')

/**
 * check the enviroment
 */
const isProduction = process.env.NODE_ENV === 'production'

/**
 * config the files paths
 */
const INPUT_BASE_PATH = './src/'
const OUTPUT_BASE_PATH = './dist/'
const config = {
  paths: {
    input: {
      html: `${INPUT_BASE_PATH}**/*.html`,
      templates: `${INPUT_BASE_PATH}templates/**/*.tpl`,
      less: `${INPUT_BASE_PATH}less/**/*.less`,
      css: `${INPUT_BASE_PATH}css/**/*.css`,
      js: `${INPUT_BASE_PATH}js/**/*.js`,
      assets: `${INPUT_BASE_PATH}assets/**/*`,
    },
    output: {
      html: OUTPUT_BASE_PATH,
      css: `${OUTPUT_BASE_PATH}css`,
      js: `${OUTPUT_BASE_PATH}js`,
      assets: `${OUTPUT_BASE_PATH}assets`,
    }
  }
}

/**
 * Convert html
 * 1. import templates
 * 2. minify html files
 * 3. output html files to html directory
 */
const htmlConverter = () => gulp
  .src(config.paths.input.html)
  .pipe(plumber())
  .pipe(contentIncluder({
    includerReg: /<!\-\-\s*tpl\(([\S]+)\)\s*\-\->/g
  }))
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeAttributeQuotes: true,
  }))
  .pipe(gulp.dest(config.paths.output.html))

/**
 * Convert less
 * 1. transform less to css codes
 * 2. add browser prefixer into code
 * 3. minify the css code
 * 4. output to css directory
 */
const lessConverter = () => gulp
  .src(config.paths.input.less)
  .pipe(plumber())
  .pipe(less())
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cssMin())
  .pipe(gulp.dest(config.paths.output.css))

/**
 * Convert css
 * 1. add browser prefixer into code
 * 2. minify the css code
 * 3. output to css directory
 */
const cssConverter = () => gulp
  .src(config.paths.input.css)
  .pipe(plumber())
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cssMin())
  .pipe(gulp.dest(config.paths.output.css))

/**
 * Convert js
 * 1. transform JavaScript codes.
 * 2. uglify the code.
 * 3. output to the js dirctory
 */
const jsConverter = () => gulp
  .src(config.paths.input.js)
  .pipe(plumber())
  // .pipe(eslint())
  .pipe(babel({
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['Android > 4', 'ios_saf > 8', 'ie > 7', 'Chrome > 50']
          },
        }
      ],
    ]
  }))
  .pipe(uglify())
  .pipe(gulp.dest(config.paths.output.js))

/**
 * Convert assets files
 */
const assetsConverter = () => gulp
  .src(config.paths.input.assets)
  .pipe(gulp.dest(config.paths.output.assets))

/**
 * Clear dist directory
 */
const distClearTask = () => del(OUTPUT_BASE_PATH)

/**
 * serve dev server
 * @param {Function} callback callback
 */
const serve = callback => () => {

  gulp.watch(config.paths.input.html, htmlConverter)
  gulp.watch(config.paths.input.less, lessConverter)
  gulp.watch(config.paths.input.css, cssConverter)
  gulp.watch(config.paths.input.js, jsConverter)
  gulp.watch(config.paths.input.assets, assetsConverter)
  gulp.watch(config.paths.input.templates, htmlConverter)

  const browserSyncer = browserSync.create()
  browserSyncer.init({
    // open: 'ui',
    server: OUTPUT_PATH,
    startPath: "/index.html",
    notify: false,
    port: 8000
  })
  callback()
}

const defaultTask = callback => {
  gulp.series(
    distClearTask,
    gulp.parallel(htmlConverter, lessConverter, cssConverter, jsConverter, assetsConverter)
  )(
    isProduction
    ? callback
    : serve(callback)
  )
}

exports.default = defaultTask

