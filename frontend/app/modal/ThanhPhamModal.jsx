import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import ThanhPhamService from '../services/thanhphamService';

function ThanhPhamModal({ visible, onHide, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    Id: null,
    Ten_thanh_pham: '',
    Mo_ta: '',
    Gia_ban: 0,
    Don_vi_tinh: '',
    So_luong_ton: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        Id: initialData.Id,
        Ten_thanh_pham: initialData.Ten_thanh_pham,
        Mo_ta: initialData.Mo_ta,
        Gia_ban: initialData.Gia_ban,
        Don_vi_tinh: initialData.Don_vi_tinh,
        So_luong_ton: initialData.So_luong_ton
      });
    } else {
      setFormData({
        Id: null,
        Ten_thanh_pham: '',
        Mo_ta: '',
        Gia_ban: 0,
        Don_vi_tinh: '',
        So_luong_ton: 0
      });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: name === 'Gia_ban' || name === 'So_luong_ton' ? Number(value) || 0 : value };
      return updatedData;
    });
  };

  const handleSubmit = async () => {
    setError('');

    // Kiểm tra dữ liệu hợp lệ
    if (!formData.Ten_thanh_pham.trim()) {
      setError('Tên thành phẩm không được để trống!');
      return;
    }
    if (!formData.Don_vi_tinh.trim()) {
      setError('Đơn vị tính không được để trống!');
      return;
    }
    if (formData.Gia_ban < 0) {
      setError('Giá bán không thể nhỏ hơn 0!');
      return;
    }
    if (formData.So_luong_ton < 0) {
      setError('Số lượng tồn không thể nhỏ hơn 0!');
      return;
    }

    try {
      console.log('Dữ liệu gửi đi:', formData); // Debug dữ liệu gửi đi

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
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Thông tin thành phẩm"
      modal
      className="p-fluid"
      style={{ width: '450px' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Hủy" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Lưu" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} />
        </div>
      }
    >
      <div className="grid">
        <div className="col-12 mb-2">
          <label htmlFor="Ten_thanh_pham" className="font-bold block mb-1">
            Tên thành phẩm
          </label>
          <InputText id="Ten_thanh_pham" name="Ten_thanh_pham" value={formData.Ten_thanh_pham} onChange={handleChange} className="w-full" />
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="Mo_ta" className="font-bold block mb-1">
            Mô tả
          </label>
          <InputText id="Mo_ta" name="Mo_ta" value={formData.Mo_ta} onChange={handleChange} className="w-full" />
        </div>

        <div className="col-6 mb-2">
          <label htmlFor="Gia_ban" className="font-bold block mb-1">
            Giá bán
          </label>
          <InputText id="Gia_ban" name="Gia_ban" type="number" value={formData.Gia_ban} onChange={handleChange} className="w-full" />
        </div>

        <div className="col-6 mb-2">
          <label htmlFor="Don_vi_tinh" className="font-bold block mb-1">
            Đơn vị tính
          </label>
          <InputText id="Don_vi_tinh" name="Don_vi_tinh" value={formData.Don_vi_tinh} onChange={handleChange} className="w-full" />
        </div>

        {/* <div className="col-12 mb-2">
          <label htmlFor="So_luong_ton" className="font-bold block mb-1">Số lượng tồn</label>
          <InputText
            id="So_luong_ton"
            name="So_luong_ton"
            type="number"
            value={formData.So_luong_ton}
            onChange={handleChange}
            disabled={!!formData.Id}
            className="w-full"
          />
        </div> */}

        {error && (
          <div className="col-12">
            <Message severity="error" text={error} className="w-full" />
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default ThanhPhamModal;
