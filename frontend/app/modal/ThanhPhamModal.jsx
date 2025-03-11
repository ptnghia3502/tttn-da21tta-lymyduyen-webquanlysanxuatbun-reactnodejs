import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const ThanhPhamModal = ({ visible, onHide, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id: 0,
    ten: "",
    loai: "",
    soLuong: 0,
    ngaySanXuat: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ id: 0, ten: "", loai: "", soLuong: 0, ngaySanXuat: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onHide();
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Thành phẩm" modal>
      <div className="p-fluid">
        <label>Tên</label>
        <InputText name="ten" value={formData.ten} onChange={handleChange} />

        <label>Loại</label>
        <InputText name="loai" value={formData.loai} onChange={handleChange} />

        <label>Số lượng</label>
        <InputText name="soLuong" type="number" value={formData.soLuong} onChange={handleChange} />

        <label>Ngày sản xuất</label>
        <InputText name="ngaySanXuat" type="date" value={formData.ngaySanXuat} onChange={handleChange} />
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default ThanhPhamModal;
