'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ThanhPhamService from '../../services/thanhphamService';
import ThanhPhamModal from '../../modal/ThanhPhamModal';

const ThanhPhamPage = () => {
  const [dataList, setDataList] = useState([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    ten_thanh_pham: '',
    don_vi_tinh: '',
    so_luong_ton: 0,
    ngay_san_xuat: '',
    gia_ban: 0,
    mo_ta: ''
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await ThanhPhamService.getAll();
      setDataList(response.success ? (Array.isArray(response.data) ? response.data : []) : []);
    } catch (error) {
      showError('Lỗi khi tải dữ liệu');
    }
  };

  const showSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
  };

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Lỗi', detail: message, life: 3000 });
  };

  const openNew = () => {
    setFormData({
      id: null,
      ten_thanh_pham: '',
      don_vi_tinh: '',
      so_luong_ton: 0,
      ngay_san_xuat: '',
      gia_ban: 0,
      mo_ta: ''
    });
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

  const saveData = async (formData) => {
    try {
      if (isNew) {
        await ThanhPhamService.create(formData);
      } else {
        await ThanhPhamService.update(formData.id, formData);
      }
      fetchData();
      setDisplayDialog(false);
      showSuccess(isNew ? 'Thêm mới thành công' : 'Cập nhật thành công');
    } catch (error) {
      showError(isNew ? 'Lỗi khi thêm mới' : 'Lỗi khi cập nhật');
    }
  };

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <div className="p-col-12">
        <div className="card">
          <h1>Quản Lý Thành Phẩm</h1>
          <div style={{ marginBottom: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success" onClick={openNew} size='small' />
          </div>
          <ThanhPhamModal
            visible={displayDialog}
            initialData={formData}
            isNew={isNew}
            onHide={() => setDisplayDialog(false)}
            onSave={saveData} // Đảm bảo đúng prop
          />
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="ten_thanh_pham" header="Tên"></Column>
            <Column field="don_vi_tinh" header="Đơn vị tính"></Column>
            <Column field="so_luong_ton" header="Số Lượng"></Column>
            <Column field="gia_ban" header="Giá"></Column>
            <Column
              body={(rowData) => (
                <>
                  <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => editData(rowData)} />
                  <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDelete(rowData.id)} />
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
