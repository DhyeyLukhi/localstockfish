#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SF="$ROOT/stockfish/src"
EMS="$ROOT/emsdk/emsdk_env.sh"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/engine"
if [[ ! -f "$EMS" ]]; then echo "Emscripten SDK not found at $EMS" >&2; exit 1; fi
mkdir -p "$OUT"
source "$EMS" >/dev/null
cd "$SF"
NET="$(sed -n 's/#define EvalFileDefaultName "\([^"]*\)"/\1/p' evaluate.h)"
make clean
COMPCXX=em++ make -j2 build ARCH=wasm32 COMP=clang RTLIB=compiler-rt clangmajorversion=16 EXTRALDFLAGS="-sENVIRONMENT=worker -sALLOW_MEMORY_GROWTH -sPTHREAD_POOL_SIZE=4 -sPROXY_TO_PTHREAD=1 -sEXPORTED_RUNTIME_METHODS=callMain --preload-file $NET@/$NET"
cp stockfish.js "$OUT/stockfish.js"
cp stockfish.wasm "$OUT/stockfish.wasm"
cp stockfish.data "$OUT/stockfish.data"
if [[ -f stockfish.worker.js ]]; then cp stockfish.worker.js "$OUT/stockfish.worker.js"; fi
(cd "$OUT" && sha256sum stockfish.js stockfish.wasm stockfish.data | sha256sum | cut -d' ' -f1 > engine.version)
echo "Built local Stockfish WebAssembly in $OUT"
