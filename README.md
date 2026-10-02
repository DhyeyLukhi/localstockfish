# Stillpoint

Private, browser-based PGN analysis. Chess positions are parsed in the browser and locally compiled Stockfish runs in a dedicated worker; no game is uploaded.

## Run locally

```sh
npm install
npm run build:engine
npm run dev
```

Open the local Vite URL printed by the command. The dev and preview servers set the cross-origin isolation headers required by WebAssembly threads and `SharedArrayBuffer`. Production UI files are created with `npm run build` in `dist/`.

## Local Stockfish engine

`npm run build:engine` compiles the Stockfish source from `../stockfish/src` with the Emscripten SDK in `../emsdk`. It writes the generated `stockfish.js`, `stockfish.wasm`, and `stockfish.data` to `public/engine/`; no WebAssembly engine is downloaded. The data file contains Stockfish's NNUE evaluation network and is required by this build. The worker wrapper at `public/engine/worker.js` initializes UCI and delegates nested Emscripten pthread workers to the locally generated runtime.

The app uses UCI over a shared command buffer to a dedicated worker. The large WASM and NNUE responses are cached locally in versioned Cache Storage after the first successful fetch. Standard analysis uses a lower depth and smaller hash; Max Performance uses a higher depth, larger hash, and more Stockfish threads, capped by the browser's reported hardware and memory. Threads require a secure context and cross-origin isolation (`COOP: same-origin` and `COEP: require-corp`). The Vite development/preview servers provide these headers. A future static host must provide them too for this threaded build, or use a separately built non-threaded variant. No deployment configuration is included here.

The engine assets are generated locally from the sibling Stockfish source and are not downloaded from a third party. Build them before starting the app. Browser capability, missing asset, and engine initialization failures are surfaced in the preparation screen. Loading progress is indeterminate where the Emscripten package loader does not expose byte-level progress.

## Structure

- `src/main.js` — PGN validation, board, move navigation, scheduling, and live analysis state.
- `public/engine/worker.js` — classic worker UCI transport and pthread bootstrap.
- `src/style.css` — responsive application design.
- `chess-assets/` — supplied board and piece PNGs.
- `scripts/build-engine.sh` — local Emscripten build using the sibling Stockfish source and SDK.

Stockfish is GPLv3 licensed. See `../stockfish/Copying.txt` for its license and distribution requirements.
