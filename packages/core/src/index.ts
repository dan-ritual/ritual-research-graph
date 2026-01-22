// Core exports (browser-safe)
export * from './types.js';
export * from './markdown-parser.js';
export * from './modes/index.js';
export * from './db.js';

// Note: registry.js and index-manager.js use Node's 'fs' module
// Import them directly in server-only contexts:
//   import { loadRegistry } from '@ritual-research/core/dist/registry.js';
//   import { loadIndex } from '@ritual-research/core/dist/index-manager.js';