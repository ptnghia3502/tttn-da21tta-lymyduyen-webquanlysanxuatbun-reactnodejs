-- Thêm vào đầu file
SET GLOBAL time_zone = '+07:00';
SET time_zone = '+07:00';

-- Bảng Người Dùng
CREATE TABLE NguoiDung (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
    Mat_khau VARCHAR(255) NOT NULL,
    Ho_ten VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    SDT VARCHAR(15),
    Ngay_Tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    Trang_thai TINYINT DEFAULT 1
);

-- Bảng Quyền
CREATE TABLE Quyen (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten_quyen VARCHAR(50) NOT NULL,
    Mo_ta TEXT
);
-- Thêm vào script_CSDL.sql
INSERT INTO Quyen (Ten_quyen, Mo_ta) VALUES 
('Admin', 'Quản trị viên hệ thống'),
('User', 'Người dùng thông thường');

-- Bảng Quan hệ Người Dùng - Quyền
CREATE TABLE Quyen_NguoiDung (
    Nguoi_dung_id INT,
    Quyen_id INT,
    PRIMARY KEY (Nguoi_dung_id, Quyen_id),
    FOREIGN KEY (Nguoi_dung_id) REFERENCES NguoiDung(Id) ON DELETE CASCADE,
    FOREIGN KEY (Quyen_id) REFERENCES Quyen(Id) ON DELETE CASCADE
);

-- Bảng Thành Phẩm
CREATE TABLE ThanhPham (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten_thanh_pham VARCHAR(100) NOT NULL,
    So_luong INT DEFAULT 0,
    Don_vi_tinh VARCHAR(50),
    Ngay_san_xuat DATE,
    Gia_ban DECIMAL(15,2),
    Mo_ta TEXT
);

-- Bảng Công Thức
DROP TABLE IF EXISTS CongThuc;
CREATE TABLE CongThuc (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Thanh_pham_id INT,
    Ten_cong_thuc VARCHAR(100) NOT NULL,
    Mo_ta TEXT,
    Ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Thanh_pham_id) REFERENCES ThanhPham(Id) ON DELETE CASCADE
);

-- Bảng Nguyên Vật Liệu
CREATE TABLE NguyenVatLieu (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ten_nguyen_lieu VARCHAR(100) NOT NULL,
    Gia DECIMAL(15,2),
    So_luong_ton INT DEFAULT 0,
    Don_vi_tinh VARCHAR(50),
    Ngay_cap_nhat DATE
);

-- Bảng Chi Tiết Công Thức
DROP TABLE IF EXISTS ChiTietCongThuc;
CREATE TABLE ChiTietCongThuc (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Cong_thuc_id INT,
    Nguyen_vat_lieu_id INT,
    So_luong_can DECIMAL(10,2) NOT NULL,
    Don_vi_tinh VARCHAR(50),
    FOREIGN KEY (Cong_thuc_id) REFERENCES CongThuc(Id) ON DELETE CASCADE,
    FOREIGN KEY (Nguyen_vat_lieu_id) REFERENCES NguyenVatLieu(Id)
);

-- Bảng Lịch Sử Sản Xuất
DROP TABLE IF EXISTS LichSuSanXuat;
CREATE TABLE LichSuSanXuat (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Thanh_pham_id INT,
    Cong_thuc_id INT,
    So_luong DECIMAL(10,2),
    Ngay_san_xuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    Nguoi_thuc_hien INT,
    FOREIGN KEY (Thanh_pham_id) REFERENCES ThanhPham(Id),
    FOREIGN KEY (Cong_thuc_id) REFERENCES CongThuc(Id),
    FOREIGN KEY (Nguoi_thuc_hien) REFERENCES NguoiDung(Id)
);

-- Bảng Nhập Kho
CREATE TABLE NhapKho (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ma_nhap_kho VARCHAR(50) UNIQUE NOT NULL,
    Ngay_nhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    Nguoi_nhap_id INT,
    Tong_tien DECIMAL(15,2),
    Ghi_chu TEXT,
    FOREIGN KEY (Nguoi_nhap_id) REFERENCES NguoiDung(Id) ON DELETE SET NULL
);

-- Bảng Chi Tiết Nhập Kho
CREATE TABLE ChiTietNhapKho (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nguyen_vat_lieu_id INT,
    Nhap_kho_id INT,
    So_luong INT NOT NULL,
    Don_gia DECIMAL(15,2),
    Thanh_tien DECIMAL(15,2),
    Ghi_chu TEXT,
    FOREIGN KEY (Nguyen_vat_lieu_id) REFERENCES NguyenVatLieu(Id) ON DELETE CASCADE,
    FOREIGN KEY (Nhap_kho_id) REFERENCES NhapKho(Id) ON DELETE CASCADE
);

-- Bảng Xuất Kho
CREATE TABLE XuatKho (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Ma_xuat_kho VARCHAR(50) UNIQUE NOT NULL,
    Ngay_xuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    Nguoi_xuat_id INT,
    Tong_tien DECIMAL(15,2),
    Ghi_chu TEXT,
    FOREIGN KEY (Nguoi_xuat_id) REFERENCES NguoiDung(Id) ON DELETE SET NULL
);

-- Bảng Chi Tiết Xuất Kho
CREATE TABLE ChiTietXuatKho (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Thanh_pham_id INT,
    Xuat_kho_id INT,
    So_luong INT NOT NULL,
    Ngay_xuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Thanh_pham_id) REFERENCES ThanhPham(Id) ON DELETE CASCADE,
    FOREIGN KEY (Xuat_kho_id) REFERENCES XuatKho(Id) ON DELETE CASCADE
);