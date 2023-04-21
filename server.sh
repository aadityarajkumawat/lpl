#!/usr/bin/bash
cd ~/news-oracle
rm -rf dist && tsc && rm -f server.log && echo "Built ✨" && (node ./dist/index.js)
