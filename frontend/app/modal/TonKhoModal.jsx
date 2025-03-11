import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const TonKhoModal = ({ visible, onHide, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    id: 0,
    tenSanPham: "",
    soLuongTon: 0,
    ngayCapNhat: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ id: 0, tenSanPham: "", soLuongTon: 0, ngayCapNhat: "" });
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
    <Dialog visible={visible} onHide={onHide} header="Tồn kho" modal>
      <div className="p-fluid">
        <label>Tên sản phẩm</label>
        <InputText name="tenSanPham" value={formData.tenSanPham} onChange={handleChange} />

        <label>Số lượng tồn</label>
        <InputText name="soLuongTon" type="number" value={formData.soLuongTon} onChange={handleChange} />

        <label>Ngày cập nhật</label>
        <InputText name="ngayCapNhat" type="date" value={formData.ngayCapNhat} onChange={handleChange} />
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default TonKhoModal;
