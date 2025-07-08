/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SERPAPI_KEY: process.env.SERPAPI_KEY,
  },
};

module.exports = nextConfig;
