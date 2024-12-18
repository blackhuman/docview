
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['raw-loader']
    });
    return config;
  },
  experimental: {
    turbo: {
      rules: {
        'raw-css': {
          loaders: [
            {
              loader: 'raw-loader',
              options: {}
            }
          ],
          extensions: ['css']
        }
      },
    },
  },
};

export default nextConfig;
