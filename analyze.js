const { explore } = require('source-map-explorer');
const path = require('path');
const fs = require('fs');

const jsDir = path.join(__dirname, 'build', 'static', 'js');
const files = fs.readdirSync(jsDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.LICENSE.txt'))
  .map(f => path.join(jsDir, f));

explore(files, { noBorderChecks: true })
  .then(result => {
    const allFiles = result.bundles.flatMap(b => Object.entries(b.files));
    const totals = {};
    for (const [src, data] of allFiles) {
      totals[src] = (totals[src] || 0) + data.size;
    }

    // Group node_modules by package name
    const packages = {};
    const ownCode = {};
    for (const [src, size] of Object.entries(totals)) {
      const nmMatch = src.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
      if (nmMatch) {
        const pkg = nmMatch[1];
        packages[pkg] = (packages[pkg] || 0) + size;
      } else {
        ownCode[src] = size;
      }
    }

    const totalSize = Object.values(totals).reduce((a, b) => a + b, 0);
    const ownTotal = Object.values(ownCode).reduce((a, b) => a + b, 0);
    const depsTotal = Object.values(packages).reduce((a, b) => a + b, 0);

    const fmt = n => `${(n / 1024).toFixed(1)} KB`;
    const pct = n => `${((n / totalSize) * 100).toFixed(1)}%`;

    console.log(`\nTotal bundle: ${fmt(totalSize)}\n`);

    console.log(`=== Your code: ${fmt(ownTotal)} (${pct(ownTotal)}) ===`);
    Object.entries(ownCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([src, size]) => console.log(`  ${fmt(size).padStart(9)}  ${src}`));

    console.log(`\n=== node_modules: ${fmt(depsTotal)} (${pct(depsTotal)}) ===`);
    Object.entries(packages)
      .sort((a, b) => b[1] - a[1])
      .forEach(([pkg, size]) => console.log(`  ${fmt(size).padStart(9)}  ${pkg}`));
  })
  .catch(err => {
    console.error('Error:', err.message || err);
    process.exit(1);
  });
