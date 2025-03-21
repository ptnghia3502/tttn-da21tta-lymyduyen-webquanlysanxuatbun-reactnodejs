import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import NguyenVatLieuService from '../services/nguyenvatlieuService';

function NguyenVatLieuModal({ visible, onHide, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    Id: null,
    Ten_nguyen_lieu: '',
    Don_vi_tinh: '',
    So_luong_ton: '',
    Gia: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      console.log('Dữ liệu ban đầu:', initialData);
      setFormData({
        Id: initialData.Id,
        Ten_nguyen_lieu: initialData.Ten_nguyen_lieu,
        Don_vi_tinh: initialData.Don_vi_tinh,
        So_luong_ton: initialData.So_luong_ton,
        Gia: initialData.Gia
      });
    } else {
      setFormData({
        Id: null,
        Ten_nguyen_lieu: '',
        Don_vi_tinh: '',
        So_luong_ton: '',
        Gia: 0
      });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      return updatedData;
    });
  };

  const handleGiaChange = (e) => {
    setFormData(prev => ({
      ...prev,
      Gia: e.value || 0
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.Ten_nguyen_lieu.trim()) {
        setError('Tên nguyên liệu không được để trống');
        return;
      }

      if (formData.Id) {
        console.log('Cập nhật nguyên liệu:', formData);
        await NguyenVatLieuService.update(formData.Id, {
          So_luong_ton: Number(formData.So_luong_ton),
          Ten_nguyen_lieu: formData.Ten_nguyen_lieu,
          Don_vi_tinh: formData.Don_vi_tinh,
          Gia: Number(formData.Gia)
        });
      } else {
        await NguyenVatLieuService.create({
          Ten_nguyen_lieu: formData.Ten_nguyen_lieu,
          Don_vi_tinh: formData.Don_vi_tinh,
          So_luong_ton: Number(formData.So_luong_ton),
          Gia: Number(formData.Gia)
        });
      }

      onSuccess();
      onHide();
    } catch (error) {
      console.error('Lỗi khi lưu nguyên liệu:', error);
      setError('Lỗi khi lưu nguyên liệu. Vui lòng thử lại.');
    }
  };

  const handleDelete = async () => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa nguyên liệu này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (formData.Id) {
            await NguyenVatLieuService.delete(formData.Id);
            onSuccess(); // Gọi lại hàm cập nhật danh sách từ component cha
            onHide();
          } else {
            console.warn('ID không hợp lệ!');
          }
        } catch (error) {
          console.error('Lỗi khi xóa nguyên liệu:', error.response?.data || error.message);
          setError('Lỗi khi xóa nguyên liệu. Vui lòng thử lại.');
        }
      }
    });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Thông Tin Nguyên Liệu"
      modal
      className="p-fluid"
      style={{ width: '450px' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button size='small' label="Lưu" icon="pi pi-check" onClick={handleSubmit} className="p-button-success" />
          <Button size='small' label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
          {formData.Id && <Button label="Xóa" icon="pi pi-trash" className="p-button-danger" onClick={handleDelete} />}
        </div>
      }
    >
      <div className="grid p-fluid">
        <div className="col-12 field">
          <label htmlFor="Ten_nguyen_lieu" className="font-bold mb-2 block">
            Tên nguyên liệu
          </label>
          <InputText id="Ten_nguyen_lieu" name="Ten_nguyen_lieu" value={formData.Ten_nguyen_lieu} onChange={handleChange} className="w-full" />
        </div>

        <div className="col-12 field">
          <label htmlFor="Don_vi_tinh" className="font-bold mb-2 block">
            Đơn vị tính
          </label>
          <InputText id="Don_vi_tinh" name="Don_vi_tinh" value={formData.Don_vi_tinh} onChange={handleChange} className="w-full" />
        </div>

        <div className="col-12 field">
          <label htmlFor="Gia" className="font-bold mb-2 block">
            Giá
          </label>
          <InputNumber
            id="Gia"
            value={formData.Gia}
            onValueChange={handleGiaChange}
            mode="currency"
            currency="VND"
            locale="vi-VN"
            className="w-full"
          />
        </div>

        {error && (
          <div className="col-12">
            <small className="p-error block mt-2">{error}</small>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default NguyenVatLieuModal;
