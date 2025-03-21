export interface XuatKho {
  Id?: number;
  Ma_xuat_kho?: string;
  Ngay_xuat?: string;
  Nguoi_xuat_id?: number;
  Nguoi_xuat?: string;
  Tong_tien?: number;
  Ghi_chu?: string;
  chi_tiet?: ChiTietXuatKho[];
}

export interface ChiTietXuatKho {
  Id?: number;
  Xuat_kho_id?: number;
  Thanh_pham_id: number;
  Ten_thanh_pham?: string;
  So_luong: number;
  Gia_ban?: number;
  Thanh_tien?: number;
  Don_vi_tinh?: string;
}

export interface XuatKhoRequest {
  Ghi_chu?: string;
  chi_tiet: {
    Thanh_pham_id: number;
    So_luong: number;
  }[];
}

export interface XuatKhoResponse {
  success: boolean;
  message?: string;
  data?: XuatKho[] | XuatKho;
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
} 