/* global jest */
// Mock for expo/src/winter/runtime.native
module.exports = {
  require: jest.fn((moduleId) => {
    // Return empty objects for native modules
    if (
      moduleId.includes("TextEncoderStream") ||
      moduleId.includes("TextDecoderStream") ||
      moduleId.includes("ReadableStream") ||
      moduleId.includes("WritableStream") ||
      moduleId.includes("TransformStream")
    ) {
      return {};
    }
    // For other modules, throw an error that can be caught
    throw new Error(`Module ${moduleId} not available in test environment`);
  }),
};
