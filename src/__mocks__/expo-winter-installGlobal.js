/* global jest */
// Mock for expo/src/winter/installGlobal
module.exports = {
  installGlobal: jest.fn(() => {
    // Setup global objects that might be accessed
    if (typeof global !== 'undefined') {
      if (!global.TextEncoderStream) {
        global.TextEncoderStream = class TextEncoderStream {
          constructor() {
            this.readable = new ReadableStream();
            this.writable = new WritableStream();
          }
        };
      }
      
      if (!global.TextDecoderStream) {
        global.TextDecoderStream = class TextDecoderStream {
          constructor() {
            this.readable = new ReadableStream();
            this.writable = new WritableStream();
          }
        };
      }
      
      if (!global.ReadableStream) {
        global.ReadableStream = class ReadableStream {};
      }
      
      if (!global.WritableStream) {
        global.WritableStream = class WritableStream {};
      }
      
      if (!global.TransformStream) {
        global.TransformStream = class TransformStream {};
      }
    }
  }),
};