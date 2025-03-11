'use client'; // Make it a client component

import Layout from '../../layout/layout';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { enqueueSnackbar } from 'notistack';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { verifyAdmin } from '../services/userAccountService';
import { Box, CircularProgress } from '@mui/material';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const patchName = usePathname();
  useEffect(() => {
    const checkUserRole = async () => {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        enqueueSnackbar('Bạn không có quyền truy cập vào trang này', {
          variant: 'info'
        });
        setLoading(false);
        return;
      }

      try {
        const role = await verifyAdmin(accessToken, patchName);
        setUserRole(role);
      } catch (error) {
        setUserRole(null);
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);
  console.log('patchName', patchName);
  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );

  return <Layout>{children}</Layout>;
}
