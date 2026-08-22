import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'وفر - خصم 30%',
    short_name: 'وفر',
    description:
      'منصة بطاقات خصم 30% للمطاعم والمقاهي والمرافق في السعودية',
    start_url: '/',
    dir: 'rtl',
    lang: 'ar',
    theme_color: '#006699',
    background_color: '#0D1526',
    display: 'standalone',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
