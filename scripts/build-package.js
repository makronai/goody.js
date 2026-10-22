import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

console.log('🛠️  Building GoodyJS for NPM...');

// 0. Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 1. Run TypeScript compiler with tsconfig.build.json
console.log('📦 Compiling TypeScript sources to dist (ESM + Declarations)...');
execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });

// 2. Post-process .d.ts files to normalize any .ts imports to .js
function normalizeDeclarationImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      normalizeDeclarationImports(fullPath);
    } else if (entry.name.endsWith('.d.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // replace from './xyz.ts' or from '../xyz.ts' with .js
      const updated = content.replace(/(from\s+['"]\.[^'"]+?)\.ts(['"])/g, '$1.js$2');
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
      }
    }
  }
}
normalizeDeclarationImports(DIST_DIR);
console.log('✅ Type declarations normalized.');

// 3. Ensure bin/good.js and bin/goody.js exist and are executable
const rootBinGood = path.join(ROOT_DIR, 'bin', 'good.js');
const rootBinGoody = path.join(ROOT_DIR, 'bin', 'goody.js');
if (fs.existsSync(rootBinGood)) {
  try {
    fs.chmodSync(rootBinGood, 0o755);
  } catch {
    // Windows may not support chmod
  }
}
if (fs.existsSync(rootBinGoody)) {
  try {
    fs.chmodSync(rootBinGoody, 0o755);
  } catch {
    // Windows may not support chmod
  }
}

// 4. Sync package distribution to packages/goodyjs
const targetDirs = [
  path.join(PACKAGES_DIR, 'goodyjs'),
];

for (const pkgDir of targetDirs) {
  if (!fs.existsSync(pkgDir)) {
    fs.mkdirSync(pkgDir, { recursive: true });
  }

  // Copy dist
  const targetDist = path.join(pkgDir, 'dist');
  if (fs.existsSync(targetDist)) {
    fs.rmSync(targetDist, { recursive: true, force: true });
  }
  fs.cpSync(DIST_DIR, targetDist, { recursive: true });

  // Copy bin
  const targetBinDir = path.join(pkgDir, 'bin');
  fs.mkdirSync(targetBinDir, { recursive: true });
  if (fs.existsSync(rootBinGood)) {
    fs.copyFileSync(rootBinGood, path.join(targetBinDir, 'good.js'));
    try { fs.chmodSync(path.join(targetBinDir, 'good.js'), 0o755); } catch {}
  }
  if (fs.existsSync(rootBinGoody)) {
    fs.copyFileSync(rootBinGoody, path.join(targetBinDir, 'goody.js'));
    try { fs.chmodSync(path.join(targetBinDir, 'goody.js'), 0o755); } catch {}
  }

  // Copy README.md & LICENSE
  if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'README.md'), path.join(pkgDir, 'README.md'));
  }
  if (fs.existsSync(path.join(ROOT_DIR, 'LICENSE'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'LICENSE'), path.join(pkgDir, 'LICENSE'));
  }

  // Ensure package.json
  const sourcePkgJson = path.join(PACKAGES_DIR, 'goodyjs', 'package.json');
  const targetPkgJson = path.join(pkgDir, 'package.json');
  if (fs.existsSync(sourcePkgJson) && targetPkgJson !== sourcePkgJson) {
    fs.copyFileSync(sourcePkgJson, targetPkgJson);
  }
}
console.log('✅ Synchronized artifacts to packages/goodyjs.');

// 5. Verify exports
const requiredExports = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/reactivity/index.js',
  'dist/reactivity/index.d.ts',
  'dist/ui/index.js',
  'dist/ui/index.d.ts',
  'dist/server/index.js',
  'dist/server/index.d.ts',
  'dist/router/index.js',
  'dist/router/index.d.ts',
  'dist/middleware/index.js',
  'dist/middleware/index.d.ts',
  'dist/ssr/index.js',
  'dist/ssr/index.d.ts',
  'dist/cli/index.js',
  'dist/cli/index.d.ts',
  'dist/ui/h.js',
  'dist/ui/h.d.ts',
];

for (const rel of requiredExports) {
  const p = path.join(ROOT_DIR, rel);
  if (!fs.existsSync(p)) {
    throw new Error(`Build verification failed: missing export ${rel}`);
  }
}

console.log(`✨ GoodyJS NPM build complete! (${requiredExports.length} export artifacts verified)`);
