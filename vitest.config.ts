import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.spec.js', 'node_modules', 'dist', 'build'],
  },
});
