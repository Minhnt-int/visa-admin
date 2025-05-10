/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['antd'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = {
  ...nextConfig,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002' + '/api/:path*', // Chuyển tiếp request đến server
      },
    ];
  },
};
