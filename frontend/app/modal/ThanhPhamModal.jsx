import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const ThanhPhamModal = ({ visible, onHide, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id: null,
    ten_thanh_pham: '',
    don_vi_tinh: '',
    so_luong_ton: 0,
    gia_ban: 0,
    ngay_san_xuat: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        ten_thanh_pham: initialData.ten_thanh_pham || '',
        don_vi_tinh: initialData.don_vi_tinh || '',
        so_luong_ton: initialData.so_luong_ton || 0,
        gia_ban: initialData.gia_ban || 0,
        ngay_san_xuat: initialData.ngay_san_xuat || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (typeof onSave === 'function') {
      onSave(formData);
      onHide();
    } else {
      console.error("onSave is not defined or not a function");
    }
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Thành phẩm" modal>
      <div className="p-fluid">
        <label>Tên</label>
        <InputText name="ten_thanh_pham" value={formData.ten_thanh_pham} onChange={handleChange} />

        <label>Đơn vị tính</label>
        <InputText name="don_vi_tinh" value={formData.don_vi_tinh} onChange={handleChange} />

        <label>Số lượng</label>
        <InputText name="so_luong_ton" type="number" value={formData.so_luong_ton} onChange={handleChange} />

        <label>Giá</label>
        <InputText name="gia_ban" type="number" value={formData.gia_ban} onChange={handleChange} />

        <label>Ngày sản xuất</label>
        <InputText name="ngay_san_xuat" type="date" value={formData.ngay_san_xuat} onChange={handleChange} />
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default ThanhPhamModal;
