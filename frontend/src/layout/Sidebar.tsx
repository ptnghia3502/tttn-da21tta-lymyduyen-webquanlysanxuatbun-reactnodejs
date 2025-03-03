import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h3>Danh mục</h3>
      <ul>
        <li><Link to="/materials">Quản lý nguyên liệu</Link></li>
        <li><Link to="/products">Quản lý thành phẩm</Link></li>
        <li><Link to="/inventory">Quản lý tồn kho</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
