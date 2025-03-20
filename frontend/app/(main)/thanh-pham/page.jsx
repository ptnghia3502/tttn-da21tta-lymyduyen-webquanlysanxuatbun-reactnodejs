"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ThanhPhamService from '../../services/thanhphamService';
import ThanhPhamModal from '../../modal/ThanhPhamModal';
import XuatKhoModal from '../../modal/XuatKhoModal';

const ThanhPhamPage = () => {
  const [dataList, setDataList] = useState([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [displayXuatKho, setDisplayXuatKho] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    Id: null,
    Ten_thanh_pham: '',
    Don_vi_tinh: '',
    Gia_ban: 0
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await ThanhPhamService.getAll();
      console.log(response.data); // Kiểm tra dữ liệu nhận được
      if (response.success) {
        setDataList(Array.isArray(response.data) ? response.data : []);
      } else {
        setDataList([]);
      }
    } catch (error) {
      showError("Lỗi khi tải dữ liệu");
    }
  };

  const showSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
  };

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Lỗi', detail: message, life: 3000 });
  };

  const openNew = () => {
    setFormData({ Id: null, Ten_thanh_pham: '', Gia_ban: 0, Don_vi_tinh: '' });
    setIsNew(true);
    setDisplayDialog(true);
  };

  const editData = (data) => {
    setFormData({ ...data });
    setIsNew(false);
    setDisplayDialog(true);
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa mục này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteData(id),
      reject: () => showError('Hủy thao tác xóa')
    });
  };

  const deleteData = async (id) => {
    try {
      await ThanhPhamService.delete(id);
      fetchData();
      showSuccess('Xóa thành công');
    } catch (error) {
      showError('Lỗi khi xóa');
    }
  };

  const openXuatKho = (item) => {
    setSelectedItem(item);
    setDisplayXuatKho(true);
  };

  const handleXuatKho = async (id, soLuongXuat) => {
    try {
      await ThanhPhamService.xuatKho(id, soLuongXuat);
      fetchData();
      showSuccess('Xuất kho thành công');
      setDisplayXuatKho(false);
    } catch (error) {
      showError('Lỗi khi xuất kho');
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const priceBodyTemplate = (rowData) => {
    console.log("Dữ liệu hàng:", rowData);
    return formatCurrency(rowData.Gia_ban);
  };

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-col-12">
        <div className="card">
          <h1>Quản Lý Thành Phẩm</h1>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success" onClick={openNew} size='small' />
            <Button label="Xuất kho" icon="pi pi-upload" className="p-button-info" onClick={() => setDisplayXuatKho(true)} size='small' />
          </div>
          <ThanhPhamModal
            visible={displayDialog}
            formData={formData}
            isNew={isNew}
            onHide={() => setDisplayDialog(false)}
            onSuccess={fetchData}
          />
          <XuatKhoModal
            visible={displayXuatKho}
            onHide={() => setDisplayXuatKho(false)}
            onSuccess={fetchData}
            toast={toast}
          />
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="Ten_thanh_pham" header="Tên"></Column>
            <Column field="Don_vi_tinh" header="Đơn vị tính"></Column>
            <Column field="Gia_ban" header="Giá" body={priceBodyTemplate}></Column>
            <Column
              body={(rowData) => (
                <>
                  <Button size="small" icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editData(rowData)} />
                  <Button size="small" icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDelete(rowData.Id)} />
                </>
              )}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default ThanhPhamPage;
