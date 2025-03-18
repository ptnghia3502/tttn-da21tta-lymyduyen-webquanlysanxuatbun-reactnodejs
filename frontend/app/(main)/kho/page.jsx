'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import KhoService from '../../services/tonkhoService';
import TonKhoModal from '../../modal/TonKhoModal';

const KhoPage = () => {
  const [dataList, setDataList] = useState([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    tenSanPham: '',
    soLuongTon: 0,
    ngayCapNhat: '',
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await KhoService.getAll();
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
    setFormData({ id: 0, tenSanPham: '', soLuongTon: 0, ngayCapNhat: '' });
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
      await KhoService.delete(id);
      fetchData();
      showSuccess('Xóa thành công');
    } catch (error) {
      showError('Lỗi khi xóa');
    }
  };

  const saveData = async (formData) => {
    try {
      if (isNew) {
        await KhoService.create(formData);
      } else {
        await KhoService.update(formData.id, formData);
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
          <h1>Quản Lý Kho</h1>
          <div style={{ marginBottom: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success" onClick={openNew} size='small' />
          </div>
          <TonKhoModal
            visible={displayDialog}
            initialData={formData}
            isNew={isNew}
            onHide={() => setDisplayDialog(false)}
            onSave={saveData}
          />
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="tenSanPham" header="Tên Sản Phẩm"></Column>
            <Column field="soLuongTon" header="Số Lượng Tồn"></Column>
            <Column field="ngayCapNhat" header="Ngày Cập Nhật"></Column>
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

export default KhoPage;
