import { Metadata } from 'next';
import AppLayout from './AppLayout'; // Import the client component

export const metadata: Metadata = {
  title: 'Quản Lý Sản Xuất Bún || Hệ Thống Quản Lý',
  description: 'Hệ thống quản lý sản xuất bún, bao gồm quản lý nguyên liệu, thành phẩm và tồn kho.',
  robots: { index: true, follow: true },
  viewport: { initialScale: 1, width: 'device-width' },
  openGraph: {
    type: 'website',
    title: 'Hệ Thống Quản Lý Sản Xuất Bún',
    url: 'https://yourwebsite.com/',
    description: 'Hệ thống quản lý sản xuất bún với các tính năng quản lý nguyên liệu, thành phẩm và tồn kho.',
    images: ['https://yourwebsite.com/static/images/banner.png'],
    ttl: 604800
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>; // Wrap with Client Component
}
