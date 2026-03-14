/** @type {import('jest').Config} */
const config = {
  displayName: 'components',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\.(png|jpg|jpeg|gif|svg|webp|ico|eot|otf|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/jest.mock.image.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.components.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)',
  ],
};

module.exports = config;
