/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: false,
  },
  images: {
    unoptimized: true,
    domains: [
      'logodix.com',
      'shutterstock.com',
      'picsum.photos',
      'res.cloudinary.com',
      'www.ypf.com',
      'upload.wikimedia.org',
      'www.slb.com',
      'www.weatherford.com',
      'www.pan-energy.com',
      'www.tecpetrol.com',
      'www.halliburton.com',
      'via.placeholder.com',
      'placeholder.com',
      'www.logodesign.net',
      'placehold.co',
      'ui-avatars.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'logodix.com',
        port: '',
        pathname: '/logos/**',
      },
      {
        protocol: 'https',
        hostname: 'shutterstock.com',
        port: '',
        pathname: '/image-photo/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/seed/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/id/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/energialy/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dbraa6jpj/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/demo/**',
      },
    ],
  },
};

module.exports = nextConfig;
