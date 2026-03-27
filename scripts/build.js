const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function build() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');

  console.log('🚀 Mulai proses rebuild...');

  // 1. Bersihkan folder dist lama
  if (fs.existsSync(distDir)) {
    console.log('🧹 Menghapus folder dist lama...');
    fs.removeSync(distDir);
  }
  fs.ensureDirSync(distDir);

  // 2. Build Frontend
  console.log('📦 Membangun frontend...');
  execSync('npm run build', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });

  // 3. Salin Backend ke dist
  console.log('🚚 Menyalin file backend...');
  const backendItems = [
    'config',
    'controllers',
    'middleware',
    'models',
    'routes',
    'utils',
    'server.js',
    'package.json',
    '.htaccess'
  ];

  backendItems.forEach(item => {
    const src = path.join(rootDir, 'backend', item);
    const dest = path.join(distDir, item);
    if (fs.existsSync(src)) {
      fs.copySync(src, dest);
    }
  });

  // 4. Salin hasil build frontend ke dist/public
  console.log('🚚 Menyalin hasil build frontend ke dist/public...');
  fs.copySync(
    path.join(rootDir, 'frontend', 'dist'),
    path.join(distDir, 'public')
  );

  // 5. Buat production package.json di dist
  console.log('📄 Mengatur package.json untuk production...');
  const pkg = fs.readJsonSync(path.join(rootDir, 'backend', 'package.json'));
  const prodPkg = {
    name: pkg.name,
    version: pkg.version,
    engines: pkg.engines,
    main: pkg.main,
    scripts: {
      "start": "node server.js"
    },
    dependencies: pkg.dependencies
  };
  fs.writeJsonSync(path.join(distDir, 'package.json'), prodPkg, { spaces: 2 });

  console.log('⭐ Build selesai! Silakan upload isi folder /dist ke hosting Anda.');
  console.log('💡 Note: Jangan lupa jalankan "npm install" di hosting jika diperlukan.');
}

build().catch(err => {
  console.error('❌ Build gagal:', err);
  process.exit(1);
});
