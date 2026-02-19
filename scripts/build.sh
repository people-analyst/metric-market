#!/bin/bash
set -e
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
cat > dist/index.cjs << 'EOF'
(async () => {
  await import("./index.js");
})();
EOF
