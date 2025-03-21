'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import NguyenVatLieuService from '../../services/nguyenvatlieuService';
import NguyenVatLieuModal from '../../modal/NguyenVatLieuModal';
import NhapKhoModal from '../../modal/NhapKhoModal';

const NguyenVatLieuPage = () => {
  const [dataList, setDataList] = useState([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [displayNhapKho, setDisplayNhapKho] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    Id: null,
    Ten_nguyen_lieu: '',
    Don_vi_tinh: '',
    Gia: 0
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await NguyenVatLieuService.getAll();
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
    setFormData({ Id: null, Ten_nguyen_lieu: '', Gia: 0, Don_vi_tinh: '' });
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
      await NguyenVatLieuService.delete(id);
      fetchData();
      showSuccess('Xóa thành công');
    } catch (error) {
      showError('Lỗi khi xóa');
    }
  };

  const openNhapKho = (item) => {
    setSelectedItem(item);
    setDisplayNhapKho(true);
  };

  const handleNhapKho = async (id, soLuongNhap) => {
    try {
      await NguyenVatLieuService.nhapKho(id, soLuongNhap);
      fetchData();
      showSuccess('Nhập kho thành công');
      setDisplayNhapKho(false);
    } catch (error) {
      showError('Lỗi khi nhập kho');
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.Gia);
  };

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-col-12">
        <div className="card">
          <h1>Quản Lý Nguyên Vật Liệu</h1>
          <div style={{ marginBottom: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} size='small' />
            <Button label="Nhập kho" icon="pi pi-download" className="p-button-info" onClick={() => setDisplayNhapKho(true)} size='small' />
          </div>
          <NguyenVatLieuModal
            visible={displayDialog}
            formData={formData}
            isNew={isNew}
            onHide={() => setDisplayDialog(false)}
            onSuccess={fetchData}
          />
          <NhapKhoModal
            visible={displayNhapKho}
            onHide={() => setDisplayNhapKho(false)}
            onSuccess={fetchData}
            toast={toast}
          />
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="Ten_nguyen_lieu" header="Tên"></Column>
            <Column field="Don_vi_tinh" header="Đơn vị tính"></Column>
            <Column field="Gia" header="Giá" body={priceBodyTemplate}></Column>
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

export default NguyenVatLieuPage;
