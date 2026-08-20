export const SITE_NAME = 'وفر' as const;

export const PUBLIC_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wafir.gleeze.com';

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.wafir.gleeze.com';

export const OWNER_URL =
  process.env.NEXT_PUBLIC_OWNER_URL ?? 'https://facility.wafir.gleeze.com';

export const DISCOUNT_RATE = 30 as const;
