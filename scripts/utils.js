const path = require('path')
const fs = require('fs')

function resolveRootPath(...args) {
  return path.resolve(__dirname, '../', ...args)
}

function isDirectory(pathname) {
  try {
    const state = fs.statSync(pathname)
    return state.isDirectory()
  } catch (e) {
    return false
  }
}

// 遍历目录下的文件夹并获取文件夹名字
function traverseDirectory(pathname) {
  const realPath = resolveRootPath(pathname)
  if (isDirectory(realPath)) {
    try {
      return fs
        .readdirSync(realPath)
        .filter((dirName) => isDirectory(path.resolve(pathname, dirName)))
    } catch (e) {
      return []
    }
  } else {
    return []
  }
}

module.exports = {
  resolveRootPath,
  traverseDirectory,
}
