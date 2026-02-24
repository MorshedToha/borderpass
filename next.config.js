/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
            { protocol: "https", hostname: "cdn.borderpass.ai" },
        ],
    },
    // WebSocket support via custom server requires disabling certain defaults
    webpack(config) {
        config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" });
        return config;
    },
};

module.exports = nextConfig;
