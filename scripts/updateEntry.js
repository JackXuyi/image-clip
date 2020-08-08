const fs = require('fs')
const { log, error, info } = require('./log')
const { traverseDirectory, resolveRootPath } = require('./utils')

log('开始更新入口文件')
const components = traverseDirectory('./components')

const str = components
  .filter((name) => !['utils', 'style', 'Menu'].includes(name))
  .reduce((prev, curr) => {
    const moduleName = `${curr}`.replace(/^\S/, (str) => `${str}`.toUpperCase())
    log(`从 ./components/${curr} 文件夹导出模块 ${moduleName}`)
    prev = `${prev}export { default as ${moduleName} } from './${curr}'\n`
    return prev
  }, '')

try {
  fs.writeFileSync(resolveRootPath('./components/index.tsx'), str)
  info('更新入口文件成功')
} catch (e) {
  error('更新入口文件失败，失败原因：', e)
}
