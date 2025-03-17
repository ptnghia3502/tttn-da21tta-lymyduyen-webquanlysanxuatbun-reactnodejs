'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import NguyenVatLieuService from '../../services/nguyenvatlieuService';
import NguyenVatLieuModal from '../../modal/NguyenVatLieuModal'; 

const NguyenVatLieuPage = () => {
  const [dataList, setDataList] = useState([]);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({ // phần này chưa fix nhưng chú ý lại key phù hợp với form
    Id: null,
    Ten_nguyen_lieu: '',
    Don_vi_tinh: '',
    So_luong_ton: '',
    Gia: 0
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await NguyenVatLieuService.getAll();
      console.log("API Response:", response); // Kiểm tra dữ liệu từ API
  
      if (response.success) {
        console.log("Dữ liệu từ API:", response.data); // Log dữ liệu thực tế
        setDataList(Array.isArray(response.data) ? response.data : []);
      } else {
        setDataList([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showError("Lỗi khi tải dữ liệu");
    }
  };
  useEffect(() => {
    console.log("Danh sách sau khi setDataList:", dataList);
  }, [dataList]);

  const showSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
  };

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Lỗi', detail: message, life: 3000 });
  };

  const openNew = () => {
    setFormData({ Id: null, Ten_nguyen_lieu: '', Gia: 0, So_luong_ton: '', Don_vi_tinh: '' });
    setIsNew(true);
    setDisplayDialog(true);
  };

  const editData = (data) => {
    console.log(data);
    setFormData({ ...data });
    setIsNew(false);
    setDisplayDialog(true);
  };

  const confirmDelete = (id) => {
    console.log("ID cần xóa:", id); // Kiểm tra ID có hợp lệ không
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

  const saveData = async () => {
    try {
      if (isNew) {
        await NguyenVatLieuService.create(formData);
      } else {
        await NguyenVatLieuService.update(formData.Id, formData);
      }
      fetchData();
      setDisplayDialog(false);
      showSuccess(isNew ? 'Thêm mới thành công' : 'Cập nhật thành công');
    } catch (error) {
      showError(isNew ? 'Lỗi khi thêm mới' : 'Lỗi khi cập nhật');
    }
  };

  const onInputChange = (e, name) => {
    const val = name === "So_luong_ton" ? Number(e.target.value) || 0 : e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: val
    }));
  };  

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <div className="p-col-12">
        <div className="card">
          <h1>Quản Lý Nguyên Vật Liệu</h1>
          <div style={{ marginBottom: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success" onClick={openNew} size='small' /> {/* Chú ý lại size */}
          </div>
          <NguyenVatLieuModal
            visible={displayDialog}
            formData={formData}
            isNew={isNew}
            onHide={() => setDisplayDialog(false)}
            onSuccess={saveData}
            onInputChange={onInputChange}
            initialData={formData}
          />
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="Ten_nguyen_lieu" header="Tên"></Column>
            <Column field="Don_vi_tinh" header="Đơn vị tính"></Column>
            <Column field="So_luong_ton" header="Số Lượng" body={(rowData) => {
            return Number(rowData.So_luong_ton) || 0; // Chuyển về số nếu có lỗi
            }} />
            <Column field="Gia" header="Giá"></Column>
            <Column
              body={(rowData) => (
                <>
                  <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => editData(rowData)} />
                  <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDelete(rowData.Id)} />
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