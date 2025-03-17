import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import ThanhPhamService from '../services/thanhphamService';

function ThanhPhamModal({ visible, onHide, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    Id: null,
    ten_thanh_pham: '',
    mo_ta: '', 
    gia_ban: 0,
    don_vi_tinh: '',
    so_luong_ton: 0,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        Id: initialData.Id,
        ten_thanh_pham: initialData.ten_thanh_pham,
        mo_ta: initialData.mo_ta,
        gia_ban: initialData.gia_ban,
        don_vi_tinh: initialData.don_vi_tinh,
        so_luong_ton: initialData.so_luong_ton,
      });
    } else {
      setFormData({
        Id: null,
        ten_thanh_pham: '',
        mo_ta: '',
        gia_ban: 0,
        don_vi_tinh: '',
        so_luong_ton: 0,
      });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gia_ban" || name === "so_luong_ton" ? Number(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    setError('');

    // Kiểm tra dữ liệu hợp lệ
    if (!formData.ten_thanh_pham.trim()) {
      setError('Tên thành phẩm không được để trống!');
      return;
    }
    if (!formData.don_vi_tinh.trim()) {
      setError('Đơn vị tính không được để trống!');
      return;
    }
    if (formData.gia_ban < 0) {
      setError('Giá bán không thể nhỏ hơn 0!');
      return;
    }
    if (formData.so_luong_ton < 0) {
      setError('Số lượng tồn không thể nhỏ hơn 0!');
      return;
    }

    try {
      console.log("Dữ liệu gửi đi:", formData); // Debug dữ liệu gửi đi

      if (formData.Id) {
        await ThanhPhamService.update(formData.Id, formData);
      } else {
        await ThanhPhamService.create(formData);
      }
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Lỗi khi lưu thành phẩm:', error.response?.data || error.message);
      setError('Lỗi khi lưu thành phẩm. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Thành phẩm" modal>
      <div className="p-fluid">
        <label>Tên thành phẩm</label>
        <InputText name="ten_thanh_pham" value={formData.ten_thanh_pham} onChange={handleChange} />

        <label>Mô tả</label>
        <InputText name="mo_ta" type="text" value={formData.mo_ta} onChange={handleChange} />

        <label>Giá bán</label>
        <InputText name="gia_ban" type="number" value={formData.gia_ban} onChange={handleChange} />

        <label>Đơn vị tính</label>
        <InputText name="don_vi_tinh" value={formData.don_vi_tinh} onChange={handleChange} />

        <label>Số lượng tồn</label>
        <InputText
          name="so_luong_ton"
          type="number"
          value={formData.so_luong_ton}
          onChange={handleChange}
          disabled={!!formData.Id}
        />

        {error && <Message severity="error" text={error} />}
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} className="p-button-success" />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
}

export default ThanhPhamModal;
