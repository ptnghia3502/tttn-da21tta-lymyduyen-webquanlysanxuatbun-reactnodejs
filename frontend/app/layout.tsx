'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Import js-cookie
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './redux/store';
import { SnackbarProvider } from 'notistack';
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra cookie bằng js-cookie
    const authToken = Cookies.get('accessToken'); // Giả sử cookie tên là 'auth_token'

    if (!authToken) {
      // Chuyển hướng đến trang đăng nhập nếu không có cookie
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-gHWo6bKmmT4Znt5kgGgsPj8xU4jqv8jnS4IAkh1T4FqI9I4Wyxz0X2sQ1N6nW8jq" crossOrigin="anonymous" />
      </head>

      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <Provider store={store}>
            <PrimeReactProvider>
              <LayoutProvider>
                {' '}
                <SnackbarProvider
                  maxSnack={3}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  autoHideDuration={2000}
                >
                  {children}{' '}
                </SnackbarProvider>
              </LayoutProvider>
            </PrimeReactProvider>
          </Provider>{' '}
        </GoogleOAuthProvider>
      </body>
      <script async src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-rbsA2VBKQIeJ2Y3dG7XnjF2FZKC1KYHoq55tCe0JG5FqNTFd1G5J4c6NDCi6t5D0" crossOrigin="anonymous"></script>
    </html>
  );
}
