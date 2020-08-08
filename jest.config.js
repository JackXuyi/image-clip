module.exports = {
  preset: 'ts-jest',
  testRegex: '/__test__/',
  transform: {
    '^.+\\.(jsx|js|ts|tsx)?$': ['ts-jest', 'babel-jest'],
  },
  modulePathIgnorePatterns: ['/__snapshots__/'],
  setupFilesAfterEnv: ['<rootDir>/setup.test.js'],
  setupFiles: ['jest-canvas-mock'],
  globals: {
    'ts-jest': {
      tsConfig: {
        allowJs: true,
        sourceMap: true,
        module: 'umd',
        target: 'es5',
        jsx: 'react',
        types: ['node'],
        declaration: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        moduleResolution: 'node',
        esModuleInterop: true,
      },
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    // 路径别名配置
    '@components/(.*)$': '<rootDir>/components/$1',
    '@lib/(.*)$': '<rootDir>/lib/$1',
  },
}
