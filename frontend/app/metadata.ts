import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý sản xuất bún',
  description: 'Hệ thống quản lý sản xuất bún',
  robots: { index: false, follow: false },
  viewport: { initialScale: 1, width: 'device-width' },
  openGraph: {
    type: 'website',
    title: 'Quản lý sản xuất bún',
    url: 'https://www.quanlysanxuatbun.com',
    description: 'Hệ thống quản lý sản xuất bún',
    images: ['https://www.quanlysanxuatbun.com/layout/images/logo-dark.svg'],
    ttl: 604800
  }
}; 