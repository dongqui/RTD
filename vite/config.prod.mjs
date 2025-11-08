import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);
            
            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}   

export default defineConfig({
    base: './',
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    },
    server: {
        port: 8080
    },
    plugins: [
        phasermsg(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'fonts/**/*', 'assets/**/*'],
            manifest: false, // Use existing manifest.json
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,gif,woff,woff2,ttf,eot,ico,webp,mp3,wav,ogg}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB for large game assets
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:mp3|wav|ogg)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'audio-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /asset-pack\.json$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'asset-pack-cache',
                            networkTimeoutSeconds: 10
                        }
                    }
                ]
            },
            devOptions: {
                enabled: false // Disable PWA in dev mode for faster development
            }
        })
    ]
});
