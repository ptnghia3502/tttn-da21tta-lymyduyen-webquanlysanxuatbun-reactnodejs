/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../redux/authSlice'; //sửa chỗ import này
import axios from 'axios';

//const axiosInstance = axios.create(); // form đăng nhập này chắc k cần axios instance đâu, tại vì chưa có accessToken, này l
const BASE_URL = process.env.NEXT_PUBLIC_URL_SERVER;

const LoginPage = () => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  const dispatch = useDispatch();
  const token = Cookies.get('accessToken');
  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa
    if (token) {
      router.push('/');
    }
  }, [router, token]); // Chạy 1 lần khi component mount
  const clickLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`https://quanly-sanxuat-tts-vnpt.onrender.com/api/users/login`, {
        username,
        password,
      });

      if (response.status === 200) {
        const { token, user } = response.data.data;
        console.log('token', response.data);
        
        // Lưu vào Redux
        dispatch(loginSuccess({ user, isAuthenticated: true, token }));

        // Lưu token vào Cookie (để tránh mất khi reload trang)
        Cookies.set('accessToken', token, { expires: 7 });// tam đóng
        // localStorage.setItem('token', token);

        // Chuyển hướng sau khi đăng nhập
        router.push('/');
      } else {
        alert('Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerClassName = classNames(
    'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
    { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
  );

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
          <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-medium mb-3">Chào mừng, Hệ Thống Quản Lý Sản Xuất Bún</div>
            </div>

            <div>
              <label htmlFor="username1" className="block text-900 text-xl font-medium mb-2">username</label>
              <InputText id="username1" type="text" placeholder="Username" value={username} onChange={(e) => setusername(e.target.value)} className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

              <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">Mật khẩu</label>
              <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" />

              <div className="flex align-items-center justify-content-between mb-5 gap-5">
                <div className="flex align-items-center">
                  <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2" />
                  <label htmlFor="rememberme1">Ghi nhớ đăng nhập</label>
                </div>
                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                  Quên mật khẩu?
                </a>
              </div>

              <Button label="Đăng nhập" onClick={clickLogin} className="w-full p-3 text-xl mb-3" disabled={loading} icon={loading ? 'pi pi-spin pi-spinner' : undefined} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
