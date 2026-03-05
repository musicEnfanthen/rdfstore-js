// ESM Compatibility Test for rdfstore-js
// Tests the dual package.json exports configuration

import { existsSync } from 'fs';
import { readFileSync } from 'fs';

console.log('🔧 E2E Test 3/3: ESM Compatibility');
console.log('================================\n');

// Test 1: Verify package configuration
console.log('📦 Step 1: Package Configuration');
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  
  if (pkg.exports && pkg.exports['.']) {
    console.log('   ✅ Package exports configured');
    console.log(`   📂 CommonJS path: ${pkg.exports['.'].require}`);
    console.log(`   📂 ESM path: ${pkg.exports['.'].import}`);
  } else {
    console.log('   ❌ Package exports not configured');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Package.json read error:', error.message);
  process.exit(1);
}

console.log('');

// Test 2: Verify files exist
console.log('📂 Step 2: File Verification');
const commonjsPath = './src/store.js';
const esmPath = './dist/rdfstore_min.js';

if (existsSync(commonjsPath)) {
  console.log('   ✅ CommonJS source file exists');
} else {
  console.log('   ❌ CommonJS source file missing');
  process.exit(1);
}

if (existsSync(esmPath)) {
  console.log('   ✅ ESM distribution file exists');
} else {
  console.log('   ❌ ESM distribution file missing');
  console.log('   💡 Run "yarn build" to generate distribution files');
  process.exit(1);
}

console.log('');

// Test 3: Dynamic import test
console.log('🔄 Step 3: Dynamic Import Test');
try {
  // Polyfill for Node.js - UMD bundle expects browser globals
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  
  const module = await import('../dist/rdfstore_min.js');
  
  if (module) {
    console.log('   ✅ Dynamic import successful');
    
    if (module.default) {
      console.log('   ✅ Default export available');
      console.log(`   🔍 Export type: ${typeof module.default}`);
    } else {
      console.log('   ⚠️  No default export (UMD format detected)');
    }
  }
} catch (error) {
  console.log('   ❌ Dynamic import failed:', error.message);
  process.exit(1);
}

console.log('\n✅ ESM compatibility verified!');
