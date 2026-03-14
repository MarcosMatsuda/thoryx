/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      // Unit & Integration tests — pure TypeScript, no React Native runtime
      displayName: 'unit',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
      },
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@data/(.*)$': '<rootDir>/src/data/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
      },
    },
    {
      // Component tests — React Native runtime via jest-expo
      displayName: 'components',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|nativewind|react-native-mmkv)',
      ],
      testMatch: ['<rootDir>/src/**/*.test.tsx'],
      moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@data/(.*)$': '<rootDir>/src/data/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '.+\\.(png|jpg|jpeg|gif|svg|webp|ico|eot|otf|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/jest.mock.image.js',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testPathIgnorePatterns: ['/node_modules/'],
    },
  ],
  // Coverage threshold will be enforced once Test Writer Agent adds meaningful tests
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
  ],
}

module.exports = config
