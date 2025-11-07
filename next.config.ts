//import {NextConfig} from 'next';
//import createNextIntlPlugin from 'next-intl/plugin';
//
//const withNextIntl = createNextIntlPlugin();
//
//const config: NextConfig = {};
//
//export default withNextIntl(config);
//


// next.config.ts

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Point the plugin to your specific routing configuration file
const withNextIntl = createNextIntlPlugin('./i18n/routing.ts');

const config: NextConfig = {
    // any other next.js config you have goes here
};

export default withNextIntl(config);
