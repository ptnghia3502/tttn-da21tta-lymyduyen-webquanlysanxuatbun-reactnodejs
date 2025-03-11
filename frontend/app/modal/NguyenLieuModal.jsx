import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import NguyenLieuService from "../services/nguyenlieuService";

const NguyenLieuModal = ({ visible, onHide, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    id: 0,
    Ten_nguyen_lieu: "",
    Mo_ta: "",
    Don_vi_tinh_id: null,
    So_luong: 0,
    Gia: 0,
    Trang_thai: "active",
  });

  const [loading, setLoading] = useState(false);
  const donViTinhOptions = [
    { label: "Kg", value: 1 },
    { label: "Gram", value: 2 },
    { label: "Lít", value: 3 },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: 0,
        Ten_nguyen_lieu: "",
        Mo_ta: "",
        Don_vi_tinh_id: null,
        So_luong: 0,
        Gia: 0,
        Trang_thai: "active",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({ ...prev, Don_vi_tinh_id: e.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        await NguyenLieuService.update(formData.id, formData);
      } else {
        await NguyenLieuService.create(formData);
      }
      onSuccess(); // Refresh danh sách sau khi lưu
      onHide();
    } catch (error) {
      console.error("Lỗi khi lưu nguyên liệu:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Nguyên liệu" modal>
      <div className="p-fluid">
        <label>Tên nguyên liệu</label>
        <InputText name="Ten_nguyen_lieu" value={formData.Ten_nguyen_lieu} onChange={handleChange} />

        <label>Mô tả</label>
        <InputText name="Mo_ta" value={formData.Mo_ta} onChange={handleChange} />

        <label>Đơn vị tính</label>
        <Dropdown value={formData.Don_vi_tinh_id} options={donViTinhOptions} onChange={handleDropdownChange} placeholder="Chọn đơn vị tính" />

        <label>Số lượng</label>
        <InputText name="So_luong" type="number" value={formData.So_luong} onChange={handleChange} />

        <label>Giá</label>
        <InputText name="Gia" type="number" value={formData.Gia} onChange={handleChange} />

        <label>Trạng thái</label>
        <Dropdown name="Trang_thai" value={formData.Trang_thai} options={[{ label: "Hoạt động", value: "active" }, { label: "Ngừng", value: "inactive" }]} onChange={handleChange} />
      </div>

      <div className="mt-3">
        <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} loading={loading} />
        <Button label="Hủy" icon="pi pi-times" className="p-button-secondary" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default NguyenLieuModal;
