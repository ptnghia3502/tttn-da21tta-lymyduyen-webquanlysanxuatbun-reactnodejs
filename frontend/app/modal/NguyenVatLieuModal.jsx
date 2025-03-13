'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import NguyenLieuService from '../services/nguyenlieuService';

function NguyenLieuModal({ visible, onHide, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    id: null,
    Ten_nguyen_lieu: '',
    Don_vi_tinh: '',
    So_luong_ton: 0, // Bổ sung lại trường này
    Gia: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        Ten_nguyen_lieu: initialData.Ten_nguyen_lieu,
        Don_vi_tinh: initialData.Don_vi_tinh,
        So_luong_ton: initialData.So_luong_ton, // Lấy giá trị từ dữ liệu có sẵn
        Gia: initialData.Gia
      });
    } else {
      setFormData({
        id: null,
        Ten_nguyen_lieu: '',
        Don_vi_tinh: '',
        So_luong_ton: 0,
        Gia: 0
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
      // Kiểm tra tên nguyên liệu trùng
      const exists = await NguyenLieuService.checkExists(formData.Ten_nguyen_lieu, formData.id);
      if (exists) {
        setError('Tên nguyên liệu đã tồn tại!');
        return;
      }

      if (formData.id) {
        await NguyenLieuService.update(formData.id, {
          Ten_nguyen_lieu: formData.Ten_nguyen_lieu,
          Don_vi_tinh: formData.Don_vi_tinh,
          Gia: formData.Gia,
          // Không cập nhật `So_luong_ton` vì API không hỗ trợ
        });
      } else {
        await NguyenLieuService.create({
          Ten_nguyen_lieu: formData.Ten_nguyen_lieu,
          Don_vi_tinh: formData.Don_vi_tinh,
          So_luong_ton: formData.So_luong_ton, // Trường này được đặt khi tạo mới
          Gia: formData.Gia
        });
      }
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Lỗi khi lưu nguyên liệu:', error);
      setError('Lỗi khi lưu nguyên liệu. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Nguyên liệu" modal>
      <div className="p-fluid">
        <label>Tên nguyên liệu</label>
        <InputText name="Ten_nguyen_lieu" value={formData.Ten_nguyen_lieu} onChange={handleChange} />

        <label>Đơn vị tính</label>
        <InputText name="Don_vi_tinh" value={formData.Don_vi_tinh} onChange={handleChange} />

        <label>Số lượng tồn</label>
        <InputText name="So_luong_ton" type="number" value={formData.So_luong_ton} onChange={handleChange} disabled={!!formData.id} />
        {/* Không cho phép chỉnh sửa số lượng tồn nếu đang cập nhật */}

        <label>Giá</label>
        <InputText name="Gia" type="number" value={formData.Gia} onChange={handleChange} />

        {error && <small className="p-error">{error}</small>}
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} className="p-button-success" />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
}

export default NguyenLieuModal;
