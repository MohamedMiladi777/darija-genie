import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
   images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
}

export default nextConfig
