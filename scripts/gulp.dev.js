const gulp = require('gulp')
const { watchTsx, watchResource } = require('./gulp')

gulp.task('watchTsx', watchTsx)

gulp.task('watchResource', watchResource)

gulp.task('default', gulp.parallel('watchTsx', 'watchResource'))
