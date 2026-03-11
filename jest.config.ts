import type { Config } from 'jest'

const config: Config = {
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
        '^@/(.*)$': '<rootDir>/src/$1',
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
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 20,
    },
  },
}

export default config
