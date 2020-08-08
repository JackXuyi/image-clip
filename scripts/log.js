const chalk = require('chalk')

function log(...args) {
  console.log(chalk.gray(...args))
}

function info(...args) {
  console.log(chalk.green(...args))
}

function warn(...args) {
  console.log(chalk.yellow(...args))
}

function error(...args) {
  console.log(chalk.red(...args))
}

module.exports = {
  log,
  info,
  warn,
  error,
}
