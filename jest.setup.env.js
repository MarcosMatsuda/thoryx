// Prevents expo/src/winter/installGlobal from registering a broken getter
// that calls require() outside Jest's module scope.
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  get: () => ({}),
  set: () => {},
  configurable: true,
});
