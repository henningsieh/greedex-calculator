import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(nextConfig);
