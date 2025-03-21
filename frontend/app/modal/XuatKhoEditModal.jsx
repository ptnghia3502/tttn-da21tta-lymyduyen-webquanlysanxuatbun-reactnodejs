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

const XuatKhoEditModal = ({ visible, onHide, onSuccess, toast, xuatKhoId }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [selectedTP, setSelectedTP] = useState(null);
  const [soLuong, setSoLuong] = useState(1);
  const [chiTiet, setChiTiet] = useState([]);
  const [thanhPham, setThanhPham] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xuatKhoData, setXuatKhoData] = useState(null);

  useEffect(() => {
    if (visible && xuatKhoId) {
      loadThanhPham();
      loadXuatKhoData();
    }
  }, [visible, xuatKhoId]);

  const loadXuatKhoData = async () => {
    try {
      setLoading(true);
      const response = await XuatKhoService.getById(xuatKhoId);
      if (response.success) {
        const data = response.data;
        setXuatKhoData(data);
        setGhiChu(data.Ghi_chu || '');
        setChiTiet(data.chi_tiet?.map(item => ({
          Thanh_pham_id: item.Thanh_pham_id,
          Ten_thanh_pham: item.Ten_thanh_pham,
          So_luong: item.So_luong,
          Don_vi_tinh: item.Don_vi_tinh,
          Don_gia: item.Don_gia
        })) || []);
      }
    } catch (error) {
      console.error('Error loading xuat kho data:', error);
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin phiếu xuất kho' });
    } finally {
      setLoading(false);
    }
  };

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
    if (!selectedTP) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn thành phẩm' });
      return;
    }

    if (soLuong <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Số lượng phải lớn hơn 0' });
      return;
    }

    const existingIndex = chiTiet.findIndex(item => item.Thanh_pham_id === selectedTP.Id);
    
    if (existingIndex >= 0) {
      const updatedChiTiet = [...chiTiet];
      updatedChiTiet[existingIndex].So_luong += soLuong;
      setChiTiet(updatedChiTiet);
    } else {
      setChiTiet([
        ...chiTiet,
        {
          Thanh_pham_id: selectedTP.Id,
          Ten_thanh_pham: selectedTP.Ten_thanh_pham,
          So_luong: soLuong,
          Don_vi_tinh: selectedTP.Don_vi_tinh,
          Don_gia: selectedTP.Gia_ban
        }
      ]);
    }

    setSelectedTP(null);
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
          So_luong: item.So_luong,
          Don_gia: item.Don_gia
        }))
      };

      const response = await XuatKhoService.update(xuatKhoId, requestData);
      
      if (response.success) {
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật phiếu xuất kho thành công' });
        onSuccess();
        onHide();
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: response.message || 'Không thể cập nhật phiếu xuất kho' 
        });
      }
    } catch (error) {
      console.error('Error updating phieu xuat kho:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: error.response?.data?.message || 'Không thể cập nhật phiếu xuất kho' 
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

  if (!xuatKhoData) {
    return null;
  }

  return (
    <Dialog 
      header={`Chỉnh sửa phiếu xuất kho: ${xuatKhoData.Ma_xuat_kho}`} 
      visible={visible} 
      style={{ width: '80vw' }} 
      footer={footer} 
      onHide={onHide}
    >
      <div className="p-fluid grid formgrid">
        <div className="field col-12 md:col-4">
          <label htmlFor="ma">Mã phiếu</label>
          <InputText id="ma" value={xuatKhoData.Ma_xuat_kho || ''} readOnly />
        </div>
        <div className="field col-12 md:col-4">
          <label htmlFor="date">Ngày xuất</label>
          <InputText 
            id="date" 
            value={new Intl.DateTimeFormat('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(new Date(xuatKhoData.Ngay_xuat))} 
            readOnly 
          />
        </div>
        <div className="field col-12 md:col-4">
          <label htmlFor="user">Người xuất</label>
          <InputText id="user" value={xuatKhoData.Nguoi_xuat || ''} readOnly />
        </div>
        
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
                value={selectedTP} 
                onChange={(e) => setSelectedTP(e.value)} 
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
                  {selectedTP?.Don_vi_tinh || 'Đơn vị'}
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
            <Column field="Don_gia" header="Đơn giá" body={(rowData) => new Intl.NumberFormat('vi-VN').format(rowData.Don_gia) + ' đ'} />
            <Column field="Thanh_tien" header="Thành tiền" body={(rowData) => new Intl.NumberFormat('vi-VN').format(rowData.So_luong * rowData.Don_gia) + ' đ'} />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '80px' }} />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
};

export default XuatKhoEditModal; 