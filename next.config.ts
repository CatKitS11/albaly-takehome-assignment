import type { NextConfig } from "next";

import "dotenv/config";
const appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://localhost:3000", appUrl],
};

export default nextConfig;
