/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, {dev, isServer}) {
    // Fix the module path for dynamic wasm imports.
    // https://github.com/vercel/next.js/issues/25852.
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? '../static/wasm/[modulehash].wasm'
        : 'static/wasm/[modulehash].wasm'

    config.externals.push({
      'node:fs/promises': '{}',
    })

    return config;
  }
}

module.exports = nextConfig
