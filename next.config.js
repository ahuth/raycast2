/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, {dev, isServer}) {
    // https://github.com/vercel/next.js/issues/25852.
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? '../static/wasm/[modulehash].wasm'
        : 'static/wasm/[modulehash].wasm'

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  }
}

module.exports = nextConfig
