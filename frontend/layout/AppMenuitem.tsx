'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import React, { useEffect, useContext, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { MenuContext } from './context/menucontext';
import { usePathname, useSearchParams } from 'next/navigation';

interface MenuItem {
  to?: string;
  label?: string;
  icon?: string;
  items?: MenuItem[];
  visible?: boolean;
  disabled?: boolean;
  command?: (event: { originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>; item: MenuItem }) => void;
  replaceUrl?: boolean;
  target?: string;
  admin?: string;
  role?: string;
  badgeClass?: string;
}

interface AppMenuitemProps {
  item: MenuItem;
  parentKey?: string;
  index: number;
  root?: boolean;
  className?: string;
  selectedRole?: string;
  onRoleChange?: (role: string) => void;
}

const AppMenuitem: React.FC<AppMenuitemProps> = ({ item, parentKey, index, root, className, selectedRole, onRoleChange }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeMenu, setActiveMenu } = useContext(MenuContext);
  const key = parentKey ? parentKey + '-' + index : String(index);
  const isActiveRoute = item.to && pathname === item.to;
  const active = activeMenu === key || activeMenu.startsWith(key + '-');
  const submenuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onRouteChange = (url: any) => {
      if (item.to && item.to === url) {
        setActiveMenu(key);
      }
    };
    onRouteChange(pathname);
  }, [pathname, searchParams, item.to, key, setActiveMenu]);

  const itemClick = (event: any) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    console.log('item', item);

    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    // Kiểm tra admin và gọi callback nếu onRoleChange tồn tại
    if (item.admin == '1' && typeof onRoleChange === 'function') {
      const role = item.role || 'defaultRole';
      console.log('Calling onRoleChange with role:', role);
      onRoleChange(role);
    }

    if (item.items) {
      setActiveMenu(active ? parentKey || '' : key);
    } else {
      setActiveMenu(key);
    }
  };

  const subMenu = item.items && item.visible !== false && (
    <CSSTransition nodeRef={submenuRef} timeout={{ enter: 1000, exit: 450 }} classNames="layout-submenu" in={root ? true : active} key={item.label}>
      <ul ref={submenuRef}>
        {item.items.map((child, i) => (
          <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} selectedRole={selectedRole} onRoleChange={onRoleChange} />
        ))}
      </ul>
    </CSSTransition>
  );

  return (
    <li className={classNames({ 'layout-root-menuitem': root, 'active-menuitem': active })}>
      {root && item.visible !== false && <div className="layout-menuitem-root-text">{item.label}</div>}
      {item.visible !== false && (
        <Link href={item.to || '/'} replace={item.replaceUrl} target={item.target} onClick={(e) => itemClick(e)} className={classNames(className, 'p-ripple', { 'active-route': isActiveRoute })} tabIndex={0}>
          <i className={classNames('layout-menuitem-icon', item.icon)}></i>
          <span className="layout-menuitem-text">{item.label}</span>
          {item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
          <Ripple />
        </Link>
      )}
      {subMenu}
    </li>
  );
};

export default AppMenuitem;
