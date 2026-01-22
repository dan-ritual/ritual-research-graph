import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ritual-research/core"],
  
  async redirects() {
    return [
      // Legacy route redirects to Growth mode
      {
        source: "/microsites",
        destination: "/growth/microsites",
        permanent: false,
      },
      {
        source: "/microsites/:path*",
        destination: "/growth/microsites/:path*",
        permanent: false,
      },
      {
        source: "/entities",
        destination: "/growth/entities",
        permanent: false,
      },
      {
        source: "/entities/:path*",
        destination: "/growth/entities/:path*",
        permanent: false,
      },
      {
        source: "/pipeline",
        destination: "/growth/pipeline",
        permanent: false,
      },
      {
        source: "/pipeline/:path*",
        destination: "/growth/pipeline/:path*",
        permanent: false,
      },
      {
        source: "/jobs/:path*",
        destination: "/growth/jobs/:path*",
        permanent: false,
      },
      {
        source: "/new",
        destination: "/growth/new",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
