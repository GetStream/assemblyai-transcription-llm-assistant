/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.assemblyai.com/lemur/v3/generate/task',
      },
    ];
  },
};

export default nextConfig;
