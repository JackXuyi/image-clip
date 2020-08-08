const gulp = require('gulp')
const { runCLI } = require('jest')
const { resolveRootPath } = require('./utils')
const jestConfig = require('../jest.config')
const through2 = require('through2')
const PluginError = require('plugin-error')

const testPath = resolveRootPath('./__test__')

function gulpJest(options = {}) {
  return through2.obj((file, enc, cb) => {
    options = Object.assign(
      {
        rootDir: file ? process.cwd() : undefined,
      },
      options,
    )

    runCLI(options, [options.rootDir]).then(({ results }) => {
      if (results.numFailedTests || results.numFailedTestSuites) {
        cb(new PluginError('gulp-jest', { message: 'Tests Failed' }))
      } else if (typeof results.success !== 'undefined' && !results.success) {
        console.log('results', results)
        cb(
          new PluginError('gulp-jest', {
            message: 'Tests Failed due to coverage threshold breaches',
          }),
        )
      } else {
        cb()
      }
    })
  })
}

gulp.task('test', () => {
  process.env.NODE_ENV = 'test'
  return gulp
    .src(testPath, { allowEmpty: true })
    .pipe(gulpJest({ config: jestConfig, rootDir: resolveRootPath('./') }))
})

gulp.task('default', gulp.series('test'))
