import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const PRODUCTION = mode === 'production';

  // Auto-injects /src/main.js into index.html on a new line after the one which has VITE_AUTOINJECT
  const autoInject = () => {
    return {
      name: 'html-transform',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const pattern = /<!--.*VITE_AUTOINJECT.*-->/;
          // check if the pattern exists in the html, if not, throw error
          if (!pattern.test(html)) {
            throw new Error(`Could not find pattern ${pattern} in the html file`);
          }
          return html.replace(
            pattern,
            '<!-- Vite injected! --><script type="module" src="/src/main.js"></script>'
          );
        },
      },
    };
  };

  // Return the configuration
  return {
    base: '/watcher/',
    plugins: [
      autoInject(),
      vue(),
      VitePWA({
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: 'hAi',
          short_name: 'hAi',
          description: 'A web-based UI for hAi',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 27180,
      headers: {
        'Content-Security-Policy':
          "default-src 'self' https://api.github.com; connect-src 'self' *:5600 *:5666 *:5678 ws://*:27180; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' data:; img-src 'self' data:; object-src 'none';",
      },
    },
    publicDir: './static',
    resolve: {
      alias: { '~': path.resolve(__dirname, 'src') },
    },
    define: {
      PRODUCTION,
      AW_SERVER_URL: process.env.AW_SERVER_URL,
      COMMIT_HASH: process.env.COMMIT_HASH,
      'process.env.VUE_APP_ON_ANDROID': process.env.VUE_APP_ON_ANDROID,
    },
  };
});
