'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import NhapKhoService from '../services/nhapKhoService.mjs';
import NguyenVatLieuService from '../services/nguyenvatlieuService.jsx';

const NhapKhoModal = ({ visible, onHide, onSuccess, toast }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [selectedNVL, setSelectedNVL] = useState(null);
  const [soLuong, setSoLuong] = useState(1);
  const [chiTiet, setChiTiet] = useState([]);
  const [nguyenVatLieu, setNguyenVatLieu] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNguyenVatLieu();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setGhiChu('');
    setSelectedNVL(null);
    setSoLuong(1);
    setChiTiet([]);
  };

  const loadNguyenVatLieu = async () => {
    try {
      setLoading(true);
      const response = await NguyenVatLieuService.getAll();
      if (response.success) {
        setNguyenVatLieu(response.data);
      }
    } catch (error) {
      console.error('Error loading nguyen vat lieu:', error);
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách nguyên vật liệu' });
    } finally {
      setLoading(false);
    }
  };

  const addChiTiet = () => {
    if (!selectedNVL) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn nguyên vật liệu' });
      return;
    }

    if (soLuong <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Số lượng phải lớn hơn 0' });
      return;
    }

    const existingIndex = chiTiet.findIndex(item => item.Nguyen_vat_lieu_id === selectedNVL.Id);
    
    if (existingIndex >= 0) {
      const updatedChiTiet = [...chiTiet];
      updatedChiTiet[existingIndex].So_luong += soLuong;
      setChiTiet(updatedChiTiet);
    } else {
      setChiTiet([
        ...chiTiet,
        {
          Nguyen_vat_lieu_id: selectedNVL.Id,
          Ten_nguyen_lieu: selectedNVL.Ten_nguyen_lieu,
          So_luong: soLuong,
          Don_vi_tinh: selectedNVL.Don_vi_tinh
        }
      ]);
    }

    setSelectedNVL(null);
    setSoLuong(1);
  };

  const removeChiTiet = (index) => {
    const updatedChiTiet = [...chiTiet];
    updatedChiTiet.splice(index, 1);
    setChiTiet(updatedChiTiet);
  };

  const handleSubmit = async () => {
    if (chiTiet.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng thêm ít nhất một nguyên vật liệu' });
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        Ghi_chu: ghiChu,
        chi_tiet: chiTiet.map(item => ({
          Nguyen_vat_lieu_id: item.Nguyen_vat_lieu_id,
          So_luong: item.So_luong
        }))
      };

      const response = await NhapKhoService.create(requestData);
      
      if (response.success) {
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tạo phiếu nhập kho thành công' });
        onSuccess();
        resetForm();
        onHide();
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: response.message || 'Không thể tạo phiếu nhập kho' 
        });
      }
    } catch (error) {
      console.error('Error creating phieu nhap kho:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: error.response?.data?.message || 'Không thể tạo phiếu nhập kho' 
      });
    } finally {
      setLoading(false);
    }
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
      header="Tạo phiếu nhập kho" 
      visible={visible} 
      style={{ width: '80vw' }} 
      footer={footer} 
      onHide={onHide}
      className="p-fluid"
    >
      <div className="grid">
        <div className="col-12 mb-4">
          <label htmlFor="ghiChu" className="font-medium mb-2 block">Ghi chú</label>
          <InputTextarea 
            id="ghiChu" 
            value={ghiChu} 
            onChange={(e) => setGhiChu(e.target.value)} 
            rows={3} 
            placeholder="Nhập ghi chú cho phiếu nhập kho"
            className="w-full"
          />
        </div>

        <div className="col-12">
          <div className="flex align-items-center gap-3 mb-3">
            <h4 className="m-0">Thêm chi tiết nhập kho</h4>
            <Button 
              label="Thêm" 
              icon="pi pi-plus" 
              onClick={addChiTiet}
              className="p-button-sm"
              style={{ width: '100px' }}
            />
          </div>
          
          <div className="grid">
            <div className="col-7 field mb-4">
              <label htmlFor="nguyenVatLieu" className="font-medium mb-2 block">Nguyên vật liệu</label>
              <Dropdown 
                id="nguyenVatLieu" 
                value={selectedNVL} 
                onChange={(e) => setSelectedNVL(e.value)} 
                options={nguyenVatLieu} 
                optionLabel="Ten_nguyen_lieu" 
                placeholder="Chọn nguyên vật liệu" 
                filter
                className="w-full"
              />
            </div>

            <div className="col-4 field mb-4">
              <label htmlFor="soLuong" className="font-medium mb-2 block">Số lượng</label>
              <div className="p-inputgroup">
                <InputNumber 
                  id="soLuong" 
                  value={soLuong} 
                  onValueChange={(e) => setSoLuong(e.value || 0)} 
                  min={1} 
                  placeholder="Nhập số lượng"
                  showButtons
                  className="w-full"
                  style={{ maxWidth: '150px' }}
                />
                <span className="p-inputgroup-addon">
                  {selectedNVL?.Don_vi_tinh || 'Đơn vị'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <h4 className="mb-3">Danh sách nguyên vật liệu nhập kho</h4>
          <DataTable 
            value={chiTiet} 
            emptyMessage="Chưa có nguyên vật liệu nào"
            className="mb-3"
          >
            <Column field="Ten_nguyen_lieu" header="Tên nguyên vật liệu" />
            <Column field="So_luong" header="Số lượng" style={{ width: '150px' }} />
            <Column field="Don_vi_tinh" header="Đơn vị tính" style={{ width: '150px' }} />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '80px' }} />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
};

export default NhapKhoModal; 