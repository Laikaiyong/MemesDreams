/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "thispersondoesnotexist.com",
                port: '',
                pathname: '/**',
            },
            {
                protocol: "https",
                hostname: "ichef.bbci.co.uk",
                port: '',
                pathname: '/**',
            },
        ]
    }
};

export default nextConfig;
