let engine;
let control;
let inputBytes;
let readIndex = 0;
let endOfLine = false;

function readInput() {
  if (endOfLine) {
    endOfLine = false;
    return undefined;
  }
  for (;;) {
    const writeIndex = Atomics.load(control, 1);
    if (readIndex !== writeIndex) {
      const value = inputBytes[readIndex];
      readIndex = (readIndex + 1) % inputBytes.length;
      Atomics.store(control, 0, readIndex);
      Atomics.notify(control, 0);
      if (value === 10) endOfLine = true;
      return value;
    }
    const result = Atomics.wait(control, 1, writeIndex, 25);
    if (result === 'timed-out') {
      endOfLine = true;
      return 10;
    }
  }
}

function emit(line) {
  const text = String(line);
  postMessage({ type: 'line', line: text });
  if (text === 'uciok') postMessage({ type: 'uciok' });
  if (text === 'readyok') postMessage({ type: 'ready' });
}

self.onmessage = ({ data }) => {
  if (data.cmd === 1) {
    try {
      importScripts('/engine/stockfish.js');
      self.onmessage({ data });
    } catch (error) {
      postMessage({ type: 'error', message: `Stockfish thread could not start: ${error.message}` });
    }
    return;
  }
  if (data.type !== 'init') return;
  try {
    control = new Int32Array(data.buffer, 0, 2);
    inputBytes = new Uint8Array(data.buffer, 8);
    const options = {
      noInitialRun: true,
      noExitRuntime: true,
      stdin: readInput,
      print: emit,
      printErr: message => postMessage({ type: 'diagnostic', message: String(message) }),
      locateFile: path => `/engine/${path}`,
      onRuntimeInitialized() {
        engine = self.Module;
        postMessage({ type: 'loaded' });
        engine.callMain([]);
        postMessage({ type: 'main-returned' });
      },
      onAbort(message) {
        postMessage({ type: 'error', message: `Stockfish stopped unexpectedly: ${message}` });
      },
    };
    self.Module = options;
    cacheEngineAssets(data.cacheVersion).then(() => importScripts('/engine/stockfish.js')).catch(error => {
      postMessage({ type: 'error', message: `Stockfish could not be loaded: ${error.message}` });
    });
  } catch (error) {
    postMessage({ type: 'error', message: `Stockfish could not be loaded: ${error.message}` });
  }
};

async function cacheEngineAssets(version) {
  if (!self.caches) return;
  let cache;
  try {
    if (!version) {
      const response = await self.fetch('/engine/engine.version');
      if (response.ok) version = (await response.text()).trim();
    }
    if (!version) return;
    cache = await caches.open(`stillpoint-stockfish-${version}`);
  } catch (error) {
    postMessage({ type: 'diagnostic', message: `Engine cache is unavailable: ${error.message}` });
    return;
  }
  const originalFetch = self.fetch.bind(self);
  self.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    if (url.origin !== self.location.origin || !/^\/engine\/stockfish\.(wasm|data)$/.test(url.pathname)) {
      return originalFetch(request);
    }
    try {
      const saved = await cache.match(request);
      if (saved) return saved;
    } catch (error) {
      postMessage({ type: 'diagnostic', message: `Engine cache could not be read: ${error.message}` });
    }
    const response = await originalFetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(error => {
      postMessage({ type: 'diagnostic', message: `Engine cache could not be saved: ${error.message}` });
    });
    return response;
  };
}