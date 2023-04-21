#!/usr/bin/bash
tsc && rm -f server.log && echo "Built ✨" && (node ./dist/index.js)
