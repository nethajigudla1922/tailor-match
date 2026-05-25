import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': [
      'prisma/dev.db',
      'node_modules/.prisma/client/**/*'
    ]
  }
};

export default nextConfig;
