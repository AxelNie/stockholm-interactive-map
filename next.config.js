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
};

module.exports = nextConfig;
