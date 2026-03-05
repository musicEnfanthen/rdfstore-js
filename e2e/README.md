# E2E Tests

End-to-end tests for rdfstore-js that validate the entire system working together.

## Tests

### `test-basic.js`
Basic integration test covering:
- Store creation
- Data loading (Turtle format)
- Simple SPARQL query execution
- Result validation

**Run:** `node e2e/test-basic.js`

### `test-comprehensive.js`  
Comprehensive integration test covering:
- Store creation and data loading
- SELECT queries with filtering
- ASK queries (boolean results) 
- CONSTRUCT queries (graph building)
- Multiple data types and relationships
- Full SPARQL feature validation

**Run:** `node e2e/test-comprehensive.js`

## Usage

From the project root directory:

```bash
# Basic integration test
node e2e/test-basic.js

# Full system validation
node e2e/test-comprehensive.js
```

These tests validate that all components work together correctly and serve as integration validation for the entire rdfstore-js system.
