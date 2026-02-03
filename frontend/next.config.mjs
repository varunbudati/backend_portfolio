/**
 * Dynamic render config: keep server features enabled locally and for deploys; still allow unoptimized images.
 */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/shadefinder/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
