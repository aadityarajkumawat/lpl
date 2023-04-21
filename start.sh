#!/usr/bin/bash
rm -rf dist && tsc && rm -f server.log && echo "Built ✨" && (node ./dist/index.js)
