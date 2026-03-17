// Prevents expo/src/winter/installGlobal from registering a broken getter
// that calls require() outside Jest's module scope.
Object.defineProperty(global, "__ExpoImportMetaRegistry", {
  get: () => ({}),
  set: () => {},
  configurable: true,
});

// Define global Stream APIs before expo/winter tries to access them
if (typeof global !== "undefined") {
  if (!global.TextEncoderStream) {
    global.TextEncoderStream = class TextEncoderStream {
      constructor() {
        this.readable = { locked: false };
        this.writable = { locked: false };
      }
    };
  }

  if (!global.TextDecoderStream) {
    global.TextDecoderStream = class TextDecoderStream {
      constructor() {
        this.readable = { locked: false };
        this.writable = { locked: false };
      }
    };
  }

  if (!global.ReadableStream) {
    global.ReadableStream = class ReadableStream {
      constructor() {
        this.locked = false;
      }
    };
  }

  if (!global.WritableStream) {
    global.WritableStream = class WritableStream {
      constructor() {
        this.locked = false;
      }
    };
  }

  if (!global.TransformStream) {
    global.TransformStream = class TransformStream {
      constructor() {
        this.readable = new ReadableStream();
        this.writable = new WritableStream();
      }
    };
  }
}
