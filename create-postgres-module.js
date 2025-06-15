// create-postgres-module.js
// This script creates a postgres module directly in the dist directory

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Creating postgres module in dist directory...');

// Create the module directory
const distModulesDir = path.join(__dirname, 'dist/node_modules/postgres');
fs.mkdirSync(distModulesDir, { recursive: true });

// Create package.json
const packageJson = {
  name: 'postgres',
  version: '3.4.7',
  main: 'index.js',
  type: 'module'
};

fs.writeFileSync(
  path.join(distModulesDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create index.js with a mock implementation
const indexContent = `
// This is a direct mock module for postgres
console.log('Using direct mock postgres module in dist directory');

function postgres(connectionString, options = {}) {
  console.log('Postgres connection requested:', connectionString);
  return {
    connect: async () => console.log('Mock postgres connect called'),
    end: async () => console.log('Mock postgres end called'),
    query: async (query, params) => {
      console.log('Mock postgres query:', query, params);
      return [];
    }
  };
}

// Add the default export
postgres.default = postgres;

// Add named exports
export default postgres;
export const sql = postgres;
`;

fs.writeFileSync(path.join(distModulesDir, 'index.js'), indexContent);

// Create a direct symlink from the import path to our module
try {
  // Create a direct module in the dist directory
  console.log('Creating direct postgres module in dist directory...');
  fs.writeFileSync(
    path.join(__dirname, 'dist/postgres.mjs'),
    `
// Direct postgres module
console.log('Loading direct postgres module from dist directory');
function postgres(connectionString, options = {}) {
  console.log('Direct postgres module called with:', connectionString);
  return {
    connect: async () => console.log('Direct mock postgres connect called'),
    end: async () => console.log('Direct mock postgres end called'),
    query: async (query, params) => {
      console.log('Direct mock postgres query:', query, params);
      return [];
    }
  };
}

postgres.default = postgres;
export default postgres;
export const sql = postgres;
`
  );
  console.log('Direct postgres module created successfully');
} catch (err) {
  console.error('Error creating direct postgres module:', err);
}

console.log('Postgres module in dist directory created successfully');

// Create a patch for the index.mjs file to use our local postgres module
try {
  console.log('Creating patch for index.mjs...');
  
  // Read the current index.mjs file
  const indexPath = path.join(__dirname, 'dist/index.mjs');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Replace postgres imports with our local module
    indexContent = indexContent.replace(
      /import\s+.*\s+from\s+['"]postgres['"]/g,
      `import postgres from './postgres.mjs'`
    );
    
    // Write the patched file
    fs.writeFileSync(indexPath, indexContent);
    console.log('index.mjs patched successfully');
  } else {
    console.log('index.mjs not found, skipping patch');
  }
} catch (err) {
  console.error('Error patching index.mjs:', err);
} 