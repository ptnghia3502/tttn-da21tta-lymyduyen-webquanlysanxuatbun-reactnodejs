/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);
  interface MenuItem {
    label: string;
    icon: string;
    to?: string;
    items?: MenuItem[];
    admin?: string;
    role?: string;
  }

  // const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const menuData = [
    {
      label: 'Home',
      items: [{ label: 'Tổng quan', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
      label: 'Chức năng',
      items: [
        { label: 'Nguyên liệu', icon: 'pi pi-th-large', to: '/nguyen-vat-lieu' },
        { label: 'Thành phẩm', icon: 'pi pi-box', to: '/thanh-pham' },
        { label: 'Kho', icon: 'pi pi-box', to: '/kho' },
      ]
    }
  ];
  const accessToken = typeof window !== 'undefined' ? Cookies.get('accessToken') : null;
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const router = useRouter();
  // đóng lại chưa cần thiết gọi api menu

  // useEffect(() => {
  //   const fetchMenu = async () => {
  //     if (accessToken) {
  //       try {
  //         const url = `${process.env.NEXT_PUBLIC_URL_SERVER}/menu${selectedRole ? `?selectedRole=${selectedRole}` : ''}`;

  //         const response = await axios.get(url, {
  //           headers: { Authorization: `Bearer ${accessToken}` }
  //         });

  //         if (response.data.EC === 1) {
  //           const formattedMenu = response.data.DT.map((item: any) => ({
  //             label: item.label,
  //             icon: item.icon,
  //             to: item.url || undefined,
  //             items: item.items?.map((subItem: any) => ({
  //               label: subItem.label,
  //               to: subItem.url || undefined,
  //               icon: item.icon,
  //               admin: subItem.admin || '0',
  //               role: subItem.role || ''
  //             }))
  //           }));
  //           setMenuData(formattedMenu);
  //         }
  //       } catch (error) {
  //         if (axios.isAxiosError(error) && error.response?.data.EC === -1) {
  //           Cookies.remove('accessToken');
  //           router.push('/auth/login');
  //         }
  //         console.error('Error fetching menu:', error);
  //       }
  //     }
  //   };

  //   fetchMenu();
  // }, [accessToken, selectedRole, router]);

  const handleRoleChange = (role: any) => {
    setSelectedRole(role);
  };

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {menuData.map((item, i) => (
          <AppMenuitem
            item={item}
            root={true}
            index={i}
            key={item.label}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange} // Xác nhận callback được truyền
            parentKey={undefined}
            className={undefined}
          />
        ))}
      </ul>
      {/* Nếu là admin, hiển thị danh sách chọn role con */}
    </MenuProvider>
  );
};

export default AppMenu;
