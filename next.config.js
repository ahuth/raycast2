const path = require('node:path');
const fs = require('node:fs/promises');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, {dev, isServer}) {
    // https://github.com/vercel/next.js/issues/25852.
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? '../static/wasm/[modulehash].wasm'
        : 'static/wasm/[modulehash].wasm'

    // Symlink the static dir into the right place so Next can find the wasm files...
    // https://github.com/vercel/next.js/issues/25852#issuecomment-1057059000
    config.plugins.push(new SymlinkWebpackPlugin(isServer));

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  }
}

module.exports = nextConfig

class SymlinkWebpackPlugin {
  constructor(isServer) {
    this.isServer = isServer;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(
      'SymlinkWebpackPlugin',
      async (compiler) => {
        if (this.isServer) {
          const from = path.join(compiler.options.output.path, '../static');
          const to = path.join(compiler.options.output.path, 'static');

          try {
            await fs.access(from);
            return;
          } catch (error) {
            if (error.code === 'ENOENT') {
              // No link exists
            } else {
              throw error;
            }
          }

          await fs.symlink(to, from, 'junction');
          console.log(`created symlink ${from} -> ${to}`);
        }
      },
    );
  }
}
