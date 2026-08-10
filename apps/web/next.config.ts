import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    viewTransition: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
}

export default nextConfig
