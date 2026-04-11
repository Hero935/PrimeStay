/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin/organizations',
        destination: '/admin/management',
        permanent: true,
      },
      {
        source: '/admin/users',
        destination: '/admin/management',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;