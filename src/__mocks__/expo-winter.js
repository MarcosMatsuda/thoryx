/* global jest */
// Mock para expo/src/winter
// This file is kept for backward compatibility
// Actual mocks are in expo-winter-installGlobal.js and expo-winter-runtime.js

module.exports = {
  installGlobal: jest.fn(() => {
    if (typeof global !== 'undefined') {
      if (!global.TextEncoderStream) {
        global.TextEncoderStream = class TextEncoderStream {};
      }
      if (!global.TextDecoderStream) {
        global.TextDecoderStream = class TextDecoderStream {};
      }
    }
  }),
  runtime: {
    native: {
      require: jest.fn(() => ({}))
    }
  }
};
