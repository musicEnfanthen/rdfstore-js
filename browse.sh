#!/bin/bash

echo "** BUILDING..."
yarn run build

echo "** COPYING..."
mv dist/rdfstore.js spec/browser/rdf_store.js 
mv dist/rdfstore_min.js spec/browser/rdf_store_min.js 

open spec/browser/index.html
echo "** DONE!"
