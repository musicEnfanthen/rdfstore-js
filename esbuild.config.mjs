import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await esbuild.build({
  entryPoints: ['src/store.js'],
  bundle: true,
  format: 'iife',
  globalName: 'rdfstore',
  platform: 'browser',
  target: 'es2022',
  outfile: 'dist/rdfstore.js',
  external: [
    'sqlite3',
    'indexeddb-js'
  ],
  alias: {
    'http': resolve(__dirname, 'stubs/empty.js'),
    'https': resolve(__dirname, 'stubs/empty.js'),
    'url': resolve(__dirname, 'stubs/empty.js'),
    'fs': resolve(__dirname, 'stubs/empty.js'),
    'path': resolve(__dirname, 'stubs/empty.js')
  }
});

console.log('✅ Bundle created successfully');
