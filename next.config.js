/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    DB_USER: process.env.DB_URI,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_COLLECTION: process.env.DB_COLLECTION,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.(js|ts|tsx)$/,
        loader: "worker-loader",
      });
    }

    return config;
  },
};

module.exports = nextConfig;
