#!/bin/zsh

rm -rf dist && tsc && rm -f server.log && echo "Built ✨" && (node ./dist/index.js $1 $2)
