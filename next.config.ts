import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /Users/mac içinde başıboş bir package-lock.json var; Turbopack bunu
  // workspace kökü sanıp uyarı veriyor. Kökü bu projeye sabitliyoruz.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
