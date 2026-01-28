#!/usr/bin/env node
/**
 * Copy Proto Script
 *
 * Copies generated TypeScript files from proto/generated/ to each microservice.
 * This script is run after `buf generate` to distribute the types.
 *
 * Usage:
 *   npm run proto:generate  (runs buf generate + this script)
 *   node scripts/copy-proto.js (just copy, no regeneration)
 */

const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'proto', 'generated');

// Services that need the generated types
const SERVICES = ['ms-users', 'ms-wallet'];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory not found: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  console.log('📦 Copying generated proto types to services...');

  // Create index.ts if it doesn't exist
  const indexPath = path.join(SOURCE_DIR, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    const indexContent = `// Auto-generated index file\nexport * from './wallet';\n`;
    fs.writeFileSync(indexPath, indexContent);
    console.log('   ✅ Created index.ts');
  }

  for (const service of SERVICES) {
    const destDir = path.join(ROOT_DIR, service, 'src', 'grpc', 'generated');
    copyDir(SOURCE_DIR, destDir);
    console.log(`   ✅ Copied to ${service}/src/grpc/generated/`);
  }

  console.log('\n✅ Proto types distributed successfully!');
}

main();
