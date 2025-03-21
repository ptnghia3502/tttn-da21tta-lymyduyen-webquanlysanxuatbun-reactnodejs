export interface NhapKho {
  Id?: number;
  Ma_nhap_kho?: string;
  Ngay_nhap?: string;
  Nguoi_nhap_id?: number;
  Nguoi_nhap?: string;
  Tong_tien?: number;
  Ghi_chu?: string;
  chi_tiet?: ChiTietNhapKho[];
}

export interface ChiTietNhapKho {
  Id?: number;
  Nhap_kho_id?: number;
  Nguyen_vat_lieu_id: number;
  Ten_nguyen_lieu?: string;
  So_luong: number;
  Don_gia?: number;
  Thanh_tien?: number;
  Don_vi_tinh?: string;
  Ghi_chu?: string;
}

export interface NhapKhoRequest {
  Ghi_chu?: string;
  chi_tiet: {
    Nguyen_vat_lieu_id: number;
    So_luong: number;
  }[];
}

export interface NhapKhoResponse {
  success: boolean;
  message?: string;
  data?: NhapKho[] | NhapKho;
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
} 