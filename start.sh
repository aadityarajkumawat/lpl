#!/bin/zsh
tsc && rm -f server.log && echo "Built ✨" && (node ./dist/index.js)
