/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:443"],
            bodySizeLimit: '2mb',
        },
        serverComponentsExternalPackages: [],
    },
    webpack: (config) => {
        return config;
    },
};

export default nextConfig;
