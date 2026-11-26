import {ambientePrivado} from './app/lib/seo-visibility.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/u/147556184', search: '?v=4' },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/pethersonzada/bevans-frontend/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          ...(ambientePrivado(process.env)?[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]:[]),
        ],
      },
      {
        source: '/convite',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      // A proteção vale no HTTP mesmo quando o cliente ainda não carregou o HTML.
      ...['/login','/painel','/cadastro'].map(source=>({
        source,
        headers:[
          {key:'Referrer-Policy',value:'no-referrer'},
          {key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'},
        ],
      })),
    ];
  },
};

export default nextConfig;
