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
}

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('Dependencies patched successfully!'); 