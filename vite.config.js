import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react({ include: /\.[jt]sx?$/ })],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: {
      'process.env.REACT_APP_STATUS': JSON.stringify(env.REACT_APP_STATUS ?? ''),
      'process.env.REACT_APP_ADMIN_EMAILS': JSON.stringify(env.REACT_APP_ADMIN_EMAILS ?? ''),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    server: {
      port: 3000,
    },
    esbuild: {
      loader: 'jsx',
      jsx: 'automatic',
      include: /src\/.*\.(js|jsx)$/,
      exclude: [],
    },
    optimizeDeps: {
      entries: ['index.html'],
      esbuildOptions: {
        jsx: 'automatic',
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx',
        },
      },
    },
    preview: {
      port: 4173,
    },
  };
});
