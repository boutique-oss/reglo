import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Source du service worker (voir app/sw.ts)
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Désactivé en dev pour éviter un cache agaçant pendant le développement.
  disable: process.env.NODE_ENV === "development",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Actions serveur : pas de config particulière ici pour l'instant.
  },
};

export default withSerwist(nextConfig);
