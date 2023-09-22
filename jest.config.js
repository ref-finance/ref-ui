module.exports = {
  transform: {
    '@aurora-is-near[/\\\\].+\\.(js|jsx|ts|tsx)$':
      './babelTransformImportExport.js',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.svg$': './svgTransform.js'
  },
  setupFilesAfterEnv: ['./src/setupTests.js'],
  transformIgnorePatterns: [
    'node_modules[/\\\\](?!@aurora-is-near[/\\\\]engine[/\\\\])',
  ],
  "moduleNameMapper": {
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
    "d3": "<rootDir>/src/__mocks__/styleMock.js",
  }
};
