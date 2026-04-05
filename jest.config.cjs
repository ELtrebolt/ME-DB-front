module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': [
      'babel-jest',
      {
        presets: [['babel-preset-react-app', { runtime: 'automatic' }]],
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/test/styleMock.cjs',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp|mp4)$': '<rootDir>/test/fileMock.cjs',
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
