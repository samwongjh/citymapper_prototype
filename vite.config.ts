import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiMiddlewarePlugin(): Plugin {
  const handleApi = async (req: any, res: any, next: any) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/train') {
      try {
        const { default: handler } = await import('./api/train.js');
        return await handler(req, res);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    }
    if (url.pathname === '/api/health') {
      try {
        const { default: handler } = await import('./api/health.js');
        return await handler(req, res);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    }
    next();
  };

  return {
    name: 'api-server-middleware',
    configureServer(server: any) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handleApi);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
