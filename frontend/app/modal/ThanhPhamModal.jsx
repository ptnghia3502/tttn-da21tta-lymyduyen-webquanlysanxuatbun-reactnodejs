import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import ThanhPhamService from '../services/thanhphamService';

function ThanhPhamModal({ visible, onHide, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    id: null,
    ten_thanh_pham: '',
    don_vi_tinh: '',
    so_luong_ton: 0,
    gia_ban: 0,
    ngay_san_xuat: '',
    cong_thuc: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        ten_thanh_pham: initialData.ten_thanh_pham,
        don_vi_tinh: initialData.don_vi_tinh,
        so_luong_ton: initialData.so_luong_ton,
        gia_ban: initialData.gia_ban,
        ngay_san_xuat: initialData.ngay_san_xuat,
        cong_thuc: initialData.cong_thuc || ''
      });
    } else {
      setFormData({
        id: null,
        ten_thanh_pham: '',
        don_vi_tinh: '',
        so_luong_ton: 0,
        gia_ban: 0,
        ngay_san_xuat: '',
        cong_thuc: ''
      });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.ten_thanh_pham) {
        setError('Tên thành phẩm không được để trống!');
        return;
      }
      if (formData.id) {
        await ThanhPhamService.update(formData.id, {
          ten_thanh_pham: formData.ten_thanh_pham,
          don_vi_tinh: formData.don_vi_tinh,
          gia_ban: Number(formData.gia_ban),
          ngay_san_xuat: formData.ngay_san_xuat,
          cong_thuc: formData.cong_thuc
        });
      } else {
        await ThanhPhamService.create({
          ten_thanh_pham: formData.ten_thanh_pham,
          don_vi_tinh: formData.don_vi_tinh,
          so_luong_ton: Number(formData.so_luong_ton),
          gia_ban: Number(formData.gia_ban),
          ngay_san_xuat: formData.ngay_san_xuat,
          cong_thuc: formData.cong_thuc
        });
      }
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Lỗi khi lưu thành phẩm:', error);
      setError('Lỗi khi lưu thành phẩm. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Thành phẩm" modal>
      <div className="p-fluid">
        <label>Tên thành phẩm</label>
        <InputText name="ten_thanh_pham" value={formData.ten_thanh_pham} onChange={handleChange} />

        <label>Đơn vị tính</label>
        <InputText name="don_vi_tinh" value={formData.don_vi_tinh} onChange={handleChange} />

        <label>Số lượng tồn</label>
        <InputText name="so_luong_ton" type="number" value={formData.so_luong_ton} onChange={handleChange} disabled={!!formData.id} />

        <label>Giá bán</label>
        <InputText name="gia_ban" type="number" value={formData.gia_ban} onChange={handleChange} />

        <label>Ngày sản xuất</label>
        <InputText name="ngay_san_xuat" type="date" value={formData.ngay_san_xuat} onChange={handleChange} />

        <label>Công thức</label>
        <InputText name="cong_thuc" value={formData.cong_thuc} onChange={handleChange} />

        {error && <small className="p-error">{error}</small>}
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} className="p-button-success" />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
}

export default ThanhPhamModal;