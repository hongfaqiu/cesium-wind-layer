import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import path from 'path';
import { realpathSync } from 'fs';

// Force all @cesium/engine imports to resolve through the same path that
// cesium itself uses. Without this, pnpm may resolve @cesium/widgets to a
// newer @cesium/engine version, creating two ContextLimits singletons and
// causing "Width must be less than or equal to the maximum texture size (0)".
const cesiumRealPath = realpathSync(path.resolve(__dirname, 'node_modules/cesium'));
const cesiumEngineAlias = path.resolve(cesiumRealPath, '../@cesium/engine');

export default defineConfig({
  plugins: [react(), cesium()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@cesium/engine': cesiumEngineAlias,
    },
    dedupe: ['cesium', '@cesium/engine', '@cesium/widgets'],
  },
  server: {
    open: true,
  },
});
