'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import XuatKhoService from '../services/xuatKhoService.mjs';
import ThanhPhamService from '../services/thanhphamService.jsx';
import { Toast } from 'primereact/toast';

const XuatKhoModal = ({ visible, onHide, onSuccess, toast }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [selectedThanhPham, setSelectedThanhPham] = useState(null);
  const [soLuong, setSoLuong] = useState(1);
  const [chiTiet, setChiTiet] = useState([]);
  const [thanhPham, setThanhPham] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadThanhPham();
    }
  }, [visible]);

  const loadThanhPham = async () => {
    try {
      setLoading(true);
      const response = await ThanhPhamService.getAll();
      if (response.success) {
        setThanhPham(response.data);
      }
    } catch (error) {
      console.error('Error loading thanh pham:', error);
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách thành phẩm' });
    } finally {
      setLoading(false);
    }
  };

  const addChiTiet = () => {
    if (!selectedThanhPham) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn thành phẩm' });
      return;
    }

    if (soLuong <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Số lượng phải lớn hơn 0' });
      return;
    }

    // Kiểm tra xem thành phẩm đã được thêm vào danh sách chưa
    const existingIndex = chiTiet.findIndex(item => item.Thanh_pham_id === selectedThanhPham.Id);
    
    if (existingIndex >= 0) {
      // Cập nhật số lượng nếu đã tồn tại
      const updatedChiTiet = [...chiTiet];
      updatedChiTiet[existingIndex].So_luong += soLuong;
      setChiTiet(updatedChiTiet);
    } else {
      // Thêm mới nếu chưa tồn tại
      setChiTiet([
        ...chiTiet,
        {
          Thanh_pham_id: selectedThanhPham.Id,
          Ten_thanh_pham: selectedThanhPham.Ten_thanh_pham,
          So_luong: soLuong,
          Don_vi_tinh: selectedThanhPham.Don_vi_tinh
        }
      ]);
    }

    // Reset các trường nhập liệu
    setSelectedThanhPham(null);
    setSoLuong(1);
  };

  const removeChiTiet = (index) => {
    const updatedChiTiet = [...chiTiet];
    updatedChiTiet.splice(index, 1);
    setChiTiet(updatedChiTiet);
  };

  const handleSubmit = async () => {
    if (chiTiet.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng thêm ít nhất một thành phẩm' });
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        Ghi_chu: ghiChu,
        chi_tiet: chiTiet.map(item => ({
          Thanh_pham_id: item.Thanh_pham_id,
          So_luong: item.So_luong
        }))
      };

      const response = await XuatKhoService.create(requestData);
      
      if (response.success) {
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tạo phiếu xuất kho thành công' });
        resetForm();
        onSuccess();
        onHide();
      }
    } catch (error) {
      console.error('Error creating phieu xuat kho:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: error.response?.data?.message || 'Không thể tạo phiếu xuất kho' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGhiChu('');
    setSelectedThanhPham(null);
    setSoLuong(1);
    setChiTiet([]);
  };

  const actionBodyTemplate = (rowData, options) => {
    return (
      <Button 
        icon="pi pi-trash" 
        rounded 
        outlined 
        severity="danger" 
        onClick={() => removeChiTiet(options.rowIndex)} 
      />
    );
  };

  const footer = (
    <div>
      <Button label="Hủy" icon="pi pi-times" outlined onClick={onHide} />
      <Button label="Lưu" icon="pi pi-check" onClick={handleSubmit} loading={loading} />
    </div>
  );

  return (
    <Dialog 
      header="Tạo phiếu xuất kho" 
      visible={visible} 
      style={{ width: '80vw' }} 
      footer={footer} 
      onHide={onHide}
    >
      <div className="p-fluid grid formgrid">
        <div className="field col-12">
          <label htmlFor="ghiChu">Ghi chú</label>
          <InputTextarea 
            id="ghiChu" 
            value={ghiChu} 
            onChange={(e) => setGhiChu(e.target.value)} 
            rows={3} 
            placeholder="Nhập ghi chú cho phiếu xuất kho"
          />
        </div>

        <div className="field col-12">
          <h4>Thêm chi tiết xuất kho</h4>
          <div className="grid">
            <div className="field col-5">
              <label htmlFor="thanhPham">Thành phẩm</label>
              <Dropdown 
                id="thanhPham" 
                value={selectedThanhPham} 
                onChange={(e) => setSelectedThanhPham(e.value)} 
                options={thanhPham} 
                optionLabel="Ten_thanh_pham" 
                placeholder="Chọn thành phẩm" 
                filter
                className="w-full"
              />
            </div>

            <div className="field col-5">
              <label htmlFor="soLuong">Số lượng</label>
              <div className="p-inputgroup">
                <InputNumber 
                  id="soLuong" 
                  value={soLuong} 
                  onValueChange={(e) => setSoLuong(e.value || 0)} 
                  min={1} 
                  placeholder="Nhập số lượng"
                  showButtons
                />
                <span className="p-inputgroup-addon">
                  {selectedThanhPham?.Don_vi_tinh || 'Đơn vị'}
                </span>
              </div>
            </div>

            <div className="field col-2 flex align-items-end">
              <Button 
                label="Thêm" 
                icon="pi pi-plus" 
                onClick={addChiTiet} 
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="field col-12">
          <h4>Danh sách thành phẩm xuất kho</h4>
          <DataTable value={chiTiet} emptyMessage="Chưa có thành phẩm nào">
            <Column field="Ten_thanh_pham" header="Tên thành phẩm" />
            <Column field="So_luong" header="Số lượng" />
            <Column field="Don_vi_tinh" header="Đơn vị tính" />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '80px' }} />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
};

export default XuatKhoModal; 