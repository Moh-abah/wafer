// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   typescript: {
//     ignoreBuildErrors: false,
//   },
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "api.wafir.gleeze.com",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.wafir.gleeze.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;