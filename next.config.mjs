import nextIntl from 'next-intl/plugin';

//const withNextIntl = nextIntl('./src/i18n/request.ts');
const withNextIntl = nextIntl('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);

