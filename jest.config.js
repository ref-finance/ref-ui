module.exports = {
  transform: {
    '@aurora-is-near[/\\\\].+\\.(js|jsx|ts|tsx)$':
      './babelTransformImportExport.js',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['./src/setupTests.js'],
  transformIgnorePatterns: [
    'node_modules[/\\\\](?!@aurora-is-near[/\\\\]engine[/\\\\])',
  ],
};
