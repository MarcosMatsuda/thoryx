/* global Buffer */
// Jest mock for react-native-quick-crypto.
//
// The real module ships JSI bindings to OpenSSL and cannot be required
// inside the Node/jsdom test environments — importing it throws because
// the native module is unavailable. We delegate to @noble/hashes here so
// Pbkdf2Service can run end-to-end in tests with the same API surface
// the production code calls.

const { pbkdf2Async } = require("@noble/hashes/pbkdf2");
const { sha256 } = require("@noble/hashes/sha256");
const { sha512 } = require("@noble/hashes/sha512");
const { sha1 } = require("@noble/hashes/sha1");

function pickHash(digest) {
  switch (String(digest).toLowerCase()) {
    case "sha256":
    case "sha-256":
      return sha256;
    case "sha512":
    case "sha-512":
      return sha512;
    case "sha1":
    case "sha-1":
      return sha1;
    default:
      throw new Error(`Unsupported digest in mock: ${digest}`);
  }
}

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input && typeof input.byteLength === "number")
    return new Uint8Array(input);
  throw new Error("Unsupported input type in mock");
}

function pbkdf2(password, salt, iterations, keylen, digest, callback) {
  const hash = pickHash(digest);
  pbkdf2Async(hash, toBytes(password), toBytes(salt), {
    c: iterations,
    dkLen: keylen,
  })
    .then((bytes) => {
      const buf = Buffer.from(bytes);
      callback(null, buf);
    })
    .catch((err) => callback(err));
}

module.exports = {
  pbkdf2,
  // Add other exports lazily as the production code needs them.
};
