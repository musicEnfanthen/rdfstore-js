# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fork of Antonio Garrote's `rdfstore-js` (maintained by musicEnfanthen): an RDF graph store in plain CommonJS JavaScript that supports SPARQL 1.0 and most of SPARQL 1.1 Update. It runs in Node (>=22.22) and in the browser (esbuild bundle). The package manager is Yarn 4 via corepack (`packageManager: yarn@4.16.0`).

## Commands

```bash
yarn install --immutable     # install (as CI does)
yarn unit                    # regenerate parser, then run all Jasmine specs
yarn specs                   # run Jasmine specs only (skips parser regeneration)
yarn e2e                     # all e2e scripts in e2e/ (basic, comprehensive, readme, esm)
yarn test                    # parse-grammar + specs + e2e
yarn build                   # parse-grammar + esbuild bundle -> dist/rdfstore.js + dist/rdfstore_min.js
yarn parse-grammar           # regenerate src/parser.js from pegjs/sparql_query.grammar
```

Run a single spec file, or filter by spec name:

```bash
yarn jasmine spec/store_spec.js
yarn jasmine spec/query_engine_spec.js --filter="some describe/it text"
```

A single e2e script: `yarn e2e:basic`, `yarn e2e:comprehensive`, `yarn e2e:readme`, `yarn e2e:esm`. `e2e:esm` imports `dist/rdfstore_min.js`, so run `yarn build` first if `src/` changed.

CI ([.github/workflows/main.yml](.github/workflows/main.yml)) runs `yarn unit`, `yarn e2e`, then `yarn build` on Node 22.22, 24.16 and 26.x. There is no linter configured.

## Generated / committed artifacts

- [src/parser.js](src/parser.js) (~20k lines) is **generated** by PEG.js from [pegjs/sparql_query.grammar](pegjs/sparql_query.grammar). Never edit it by hand: change the grammar and run `yarn parse-grammar`. It is committed, and the script deletes it before rewriting it.
- `dist/rdfstore.js` and `dist/rdfstore_min.js` are build outputs and are also committed. The package `exports` map points `require` to `src/store.js` and `import` to `dist/rdfstore_min.js`, so ESM consumers only see changes after a rebuild.
- [esbuild.config.mjs](esbuild.config.mjs) bundles `src/store.js` as an IIFE with global `rdfstore`. It aliases Node built-ins (`http`, `https`, `url`, `fs`, `path`) to [stubs/empty.js](stubs/empty.js) and keeps `sqlite3`/`indexeddb-js` external.

## Architecture

Everything is callback-based (`callback(err, result)`) and asynchronous. There are no Promises in the core.

**Layering** (from the public API down to storage):

1. **[src/store.js](src/store.js)**: the public `Store` facade (`execute`, `load`, `insert`/`delete`, `graph`/`node`, events and subscriptions, `registerCustomFunction`, prefixes). The constructor picks either the in-memory backend (`Lexicon` + `QuadBackend`) or the IndexedDB backend (`PersistentLexicon` + `PersistentQuadBackend`) when `persistent: true` is set. It then builds a `QueryEngine`.
2. **[src/query_engine.js](src/query_engine.js)**: the main executor. `execute()` normalizes the query string, parses it via `AbstractQueryTree`, then sends it to `executeQuery` (SELECT/CONSTRUCT/ASK) or `executeUpdate` (INSERT/DELETE/LOAD/CLEAR/...). Update queries are wrapped in `callbacksBackend.start/end/cancelGraphModification` so that events fire.
3. **[src/abstract_query_tree.js](src/abstract_query_tree.js)**: wraps the PEG parser and rewrites the syntax tree into SPARQL algebra (BGP, JOIN, LEFT_JOIN, UNION, FILTER, ...). It raises `NonSupportedSparqlFeatureError` for unsupported features.
4. **[src/query_plan.js](src/query_plan.js)**: BGP join planning and execution against the backend. **[src/query_filters.js](src/query_filters.js)**: FILTER expressions, built-in functions, aggregates and custom functions.
5. **[src/lexicon.js](src/lexicon.js)**: maps URIs, literals and blank nodes to numeric OIDs, so that quads are stored as IDs. `QueryEngine.normalizeQuad`/`denormalizeBindings` translate between terms and OIDs.
6. **[src/quad_backend.js](src/quad_backend.js)** and **[src/quad_index.js](src/quad_index.js)**: six B-tree indices (SPOG, GP, OGS, POG, GSP, OS) over [src/btree.js](src/btree.js). The planner chooses an index by which components are bound.

**Other modules:**
- [src/graph_callbacks.js](src/graph_callbacks.js): the events API (node/query observers and subscriptions).
- [src/rdf_loader.js](src/rdf_loader.js), [src/network_transport.js](src/network_transport.js), [src/rvn3_parser.js](src/rvn3_parser.js) (N3.js) and [src/jsonld_parser.js](src/jsonld_parser.js) (jsonld): load data by media type, either from a string, a remote URL or a local file.
- [src/rdf_model.js](src/rdf_model.js): the RDF Interfaces API (`store.rdf`, graphs, nodes).

**[src/utils.js](src/utils.js) is the core's own async/collection library.** Source files import it under the names `_` and `async` (`var async = require('./utils')`), not the real `lodash`/`async` packages. Those two packages are devDependencies used only by the specs. `eachSeries` iterates through a throttled `nextTick` that yields only every `yieldFrequency` calls (default 100), to avoid stack overflows. `whilst` does **not** yield: it recurses synchronously. B-tree range traversals in [src/quad_index.js](src/quad_index.js) use it, so large indices (somewhere between about 50k and 100k triples in Node) can throw `RangeError: Maximum call stack size exceeded`. Deep synchronous recursion in new code has the same risk.

## Tests

- Jasmine config: [spec/support/jasmine.json](spec/support/jasmine.json). It sets `random: false`, but Jasmine 7 still runs the specs in random order (the output prints the seed). Pass `--random=false` or `--seed=<n>` to reproduce an order-dependent failure.
- [spec/w3c_spec.js](spec/w3c_spec.js) runs the W3C/DAWG SPARQL test suites from `spec/w3c/*/manifest.ttl` via [spec/w3c_suite_helper.js](spec/w3c_suite_helper.js). Use these to check parser and grammar changes.
- `spec/browser/` and [browse.sh](browse.sh) are manual browser smoke tests.

## Repo conventions

- Git-flow branching: day-to-day work goes on `develop`, releases go through `release/vX.Y.Z-alpha.N` branches merged to `main` and tagged. PRs target `develop`.
- Commit messages follow Conventional Commits (`build(deps): ...`, `test(e2e): ...`, `fix: ...`).
