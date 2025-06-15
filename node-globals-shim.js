
// This file adds common Node.js globals for Cloudflare Workers compatibility
export const process = {
  env: {},
  cwd: () => '/',
  version: '',
  argv: [],
  nextTick: (cb) => setTimeout(cb, 0)
};

export const Buffer = {
  from: (data, encoding) => {
    if (typeof data === 'string') {
      return encoding === 'base64' 
        ? atob(data) 
        : new TextEncoder().encode(data);
    }
    return data;
  },
  isBuffer: () => false,
  alloc: (size) => new Uint8Array(size),
  concat: (arrays) => {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
};

// Global variables
globalThis.process = process;
globalThis.Buffer = Buffer;
