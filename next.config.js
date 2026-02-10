/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.externals.push({
      'undici': 'commonjs undici',
    })
    return config
  },
}

module.exports = nextConfig
