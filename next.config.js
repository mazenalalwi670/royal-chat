/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable camera and microphone permissions
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

