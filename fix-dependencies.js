import fs from 'fs';
import path from 'path';

// Read the package.json file
const packageJsonPath = path.resolve('./package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Fix the dependency conflicts
if (packageJson.dependencies) {
  // Downgrade @react-three/drei to a version compatible with React 18
  if (packageJson.dependencies['@react-three/drei']) {
    packageJson.dependencies['@react-three/drei'] = '^9.88.0';
  }

  // Downgrade @react-three/fiber if needed
  if (packageJson.dependencies['@react-three/fiber']) {
    packageJson.dependencies['@react-three/fiber'] = '^8.15.12';
  }

  // Remove GSAP since we're using a fallback implementation
  if (packageJson.dependencies['gsap']) {
    delete packageJson.dependencies['gsap'];
  }
  
  // Remove globe.gl since we're using a fallback implementation
  if (packageJson.dependencies['globe.gl']) {
    delete packageJson.dependencies['globe.gl'];
  }
  
  // Also remove three.js if it's not needed elsewhere
  if (packageJson.dependencies['three'] && 
      !packageJson.dependencies['@react-three/drei'] && 
      !packageJson.dependencies['@react-three/fiber']) {
    delete packageJson.dependencies['three'];
  }
  
  // Ensure all critical server dependencies are present with correct versions
  const criticalDependencies = {
    'postgres': '^3.4.7',
    'pg': '^8.16.0',
    'connect-pg-simple': '^9.0.1',
    'bcrypt': '^6.0.0',
    'resend': '^4.5.2',
    'drizzle-orm': '^0.39.1',
    'express': '^4.21.2',
    'express-session': '^1.18.1',
    'better-sqlite3': '^11.9.1'
  };
  
  for (const [dep, version] of Object.entries(criticalDependencies)) {
    if (!packageJson.dependencies[dep]) {
      packageJson.dependencies[dep] = version;
    }
  }
}

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('Dependencies patched successfully!'); 