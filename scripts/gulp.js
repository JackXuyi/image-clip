const gulp = require('gulp')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')
const gulpCopy = require('gulp-copy')
const sass = require('gulp-sass')
const clean = require('gulp-clean') //清理文件或文件夹
// const uglify = require('gulp-uglify') //引入压缩组件
// const concat = require('gulp-concat') //引入合并组建

const { resolveRootPath } = require('./utils')

sass.compiler = require('node-sass')

const outputPath = resolveRootPath('./lib')
const esOutputPath = resolveRootPath('./es')
// const distOutputPath = resolveRootPath('./dist')
const source = resolveRootPath('./components')

const tsProject = ts.createProject('../tsconfig.build.json', {
  declaration: true,
})

function tsxTask() {
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest(outputPath))
}

function createCleanTask(realPath) {
  return function () {
    return gulp
      .src(realPath, { read: false, allowEmpty: true })
      .pipe(clean({ force: true }))
  }
}

function jsTask() {
  return gulp
    .src(outputPath + '/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(esOutputPath))
}

// function miniJsTask() {
//   return gulp
//     .src(esOutputPath + '/**/*.js')
//     .pipe(uglify())
//     .pipe(concat('index.min.js'))
//     .pipe(gulp.dest(distOutputPath))
// }

function sassTask() {
  return gulp
    .src([source + '/**/*.scss'])
    .pipe(gulpCopy(outputPath, { prefix: 2 }))
    .pipe(gulp.dest(outputPath))
    .pipe(gulp.dest(esOutputPath))
}

// function cssTask() {
//   return gulp
//     .src([source + '/**/*.scss'])
//     .pipe(sass().on('error', sass.logError))
//     .pipe(concat('index.min.css'))
//     .pipe(gulp.dest(distOutputPath))
// }

function copyDeclareTask() {
  return gulp
    .src([outputPath + '/**/*.d.ts'])
    .pipe(gulpCopy(esOutputPath, { prefix: 2 }))
    .pipe(gulp.dest(esOutputPath))
}

// 任务
gulp.task('clean:es', createCleanTask(esOutputPath))

gulp.task('clean:lib', createCleanTask(outputPath))

// gulp.task('clean:dist', createCleanTask(distOutputPath))

gulp.task('tsx', tsxTask)

gulp.task('declare', copyDeclareTask)

gulp.task('js', jsTask)

gulp.task('scss', sassTask)

function compiler() {
  return gulp.series(
    gulp.parallel('clean:lib', 'clean:es'),
    gulp.parallel(gulp.series('tsx', 'declare', 'js'), 'scss'),
  )
}

function watchTsx() {
  return gulp.watch(
    [resolveRootPath('components') + '/**/*.(tsx|ts)'],
    {
      events: 'all',
      ignoreInitial: false,
      delay: 500,
      // usePolling: true,
      depth: 3,
    },
    gulp.series('tsx', 'declare', 'js', 'scss'),
  )
}

function watchResource() {
  return gulp.watch(
    [resolveRootPath('components') + '/**/*.(scss|png|jpg|svg|gif)'],
    { events: 'all', ignoreInitial: false },
    gulp.series('scss'),
  )
}

module.exports = {
  compiler,
  watchTsx,
  watchResource,
}
