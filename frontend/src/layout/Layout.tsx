import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import "./Layout.css"; // Thêm file CSS để tùy chỉnh giao diện

const Layout: React.FC = () => {
  return (
    <div className="layout-container">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          <Outlet /> {/* Đây là nơi hiển thị nội dung trang */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
