import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          Gia: Number(formData.Gia),
        });
      } else {
        await NguyenVatLieuService.create({
          Ten_nguyen_lieu: formData.Ten_nguyen_lieu,
          Don_vi_tinh: formData.Don_vi_tinh,
          So_luong_ton: Number(formData.So_luong_ton),
          Gia: Number(formData.Gia),
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
            onSuccess();  // Gọi lại hàm cập nhật danh sách từ component cha
            onHide();
          } else {
            console.warn("ID không hợp lệ!");
          }
        } catch (error) {
          console.error("Lỗi khi xóa nguyên liệu:", error.response?.data || error.message);
          setError("Lỗi khi xóa nguyên liệu. Vui lòng thử lại.");
        }
      }
    });
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

        <label>Giá</label>
        <InputText name="Gia" type="number" value={formData.Gia} onChange={handleChange} />

        {error && <small className="p-error">{error}</small>}
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} className="p-button-success" />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
        {formData.Id && (
          <Button label="Xóa" icon="pi pi-trash" className="p-button-danger" onClick={handleDelete} />
        )}
      </div>
    </Dialog>
  );
}

export default NguyenVatLieuModal;