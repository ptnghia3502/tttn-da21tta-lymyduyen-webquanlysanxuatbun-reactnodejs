'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ThanhPhamService from '../../services/thanhphamService';
import ThanhPhamModal from '../../modal/ThanhPhamModal';
import XuatKhoModal from '../../modal/XuatKhoModal';
import CongThucModal from '../../modal/CongThucModal';
import SanXuatModal from '../../modal/SanXuatModal';
import CongThucService from '../../services/congThucService';
import { Dialog } from 'primereact/dialog';

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
    Gia: 0
  });
  
  // State cho modal công thức và sản xuất
  const [displayCongThucModal, setDisplayCongThucModal] = useState(false);
  const [displaySanXuatModal, setDisplaySanXuatModal] = useState(false);
  const [selectedCongThucId, setSelectedCongThucId] = useState(null);
  
  // State cho hiển thị chi tiết công thức
  const [displayCongThucDetail, setDisplayCongThucDetail] = useState(false);
  const [congThucDetail, setCongThucDetail] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await ThanhPhamService.getAll();
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
    setFormData({ Id: null, Ten_thanh_pham: '', Gia: 0, Don_vi_tinh: '' });
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
  
  // Mở modal thêm/sửa công thức
  const openCongThucModal = (thanhPham, congThucId = null) => {
    setSelectedItem(thanhPham);
    setSelectedCongThucId(congThucId);
    setDisplayCongThucModal(true);
  };
  
  // Mở modal sản xuất
  const openSanXuatModal = (thanhPham) => {
    setSelectedItem(thanhPham);
    setDisplaySanXuatModal(true);
  };

  // Xem chi tiết công thức
  const viewCongThucDetail = async (thanhPham) => {
    try {
      const response = await CongThucService.getByThanhPhamId(thanhPham.Id);
      if (response.success && response.data && response.data.length > 0) {
        setCongThucDetail(response.data);
        setDisplayCongThucDetail(true);
      } else {
        showError('Thành phẩm này chưa có công thức nào');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết công thức:', error);
      showError('Không thể lấy thông tin công thức');
    }
  };

  // Render nút hành động
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button 
          size="small" 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-success mr-2" 
          onClick={() => editData(rowData)} 
          tooltip="Sửa thông tin" 
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          size="small" 
          icon="pi pi-list" 
          className="p-button-rounded p-button-info mr-2" 
          onClick={() => openCongThucModal(rowData)} 
          tooltip="Quản lý công thức" 
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          size="small" 
          icon="pi pi-eye" 
          className="p-button-rounded p-button-secondary mr-2" 
          onClick={() => viewCongThucDetail(rowData)} 
          tooltip="Xem công thức" 
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          size="small" 
          icon="pi pi-cog" 
          className="p-button-rounded p-button-warning mr-2" 
          onClick={() => openSanXuatModal(rowData)} 
          tooltip="Sản xuất" 
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          size="small" 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger" 
          onClick={() => confirmDelete(rowData.Id)} 
          tooltip="Xóa" 
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <div className="p-grid">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-col-12">
        <div className="card">
          <h1>Quản Lý Thành Phẩm</h1>
          <div style={{ marginBottom: '10px' }}>
            <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} size='small' />
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
          
          {/* Modal quản lý công thức */}
          {displayCongThucModal && (
            <CongThucModal
              visible={displayCongThucModal}
              thanhPhamId={selectedItem?.Id}
              congThucId={selectedCongThucId}
              onHide={() => {
                setDisplayCongThucModal(false);
                setSelectedCongThucId(null);
              }}
              onSuccess={fetchData}
            />
          )}
          
          {/* Modal sản xuất */}
          {displaySanXuatModal && (
            <SanXuatModal
              visible={displaySanXuatModal}
              thanhPhamId={selectedItem?.Id}
              thanhPhamName={selectedItem?.Ten_thanh_pham}
              onHide={() => setDisplaySanXuatModal(false)}
              onSuccess={fetchData}
            />
          )}

          {/* Dialog xem chi tiết công thức */}
          <Dialog
            visible={displayCongThucDetail}
            onHide={() => {
              setDisplayCongThucDetail(false);
              setCongThucDetail(null);
            }}
            header="Chi tiết công thức"
            style={{ width: '70vw' }}
            maximizable
          >
            {congThucDetail && congThucDetail.map((congThuc, index) => (
              <div key={congThuc.Id} className="mb-4">
                <h3 className="mb-3">{congThuc.Ten_cong_thuc}</h3>
                {congThuc.Mo_ta && (
                  <p className="mb-3 text-gray-600">{congThuc.Mo_ta}</p>
                )}
                <DataTable value={congThuc.nguyen_lieu || []} className="mb-4">
                  <Column field="Ten_nguyen_lieu" header="Nguyên liệu" />
                  <Column field="So_luong_can" header="Số lượng" />
                  <Column field="Don_vi_tinh" header="Đơn vị tính" />
                </DataTable>
                {index < congThucDetail.length - 1 && <hr className="my-4" />}
              </div>
            ))}
          </Dialog>
          
          <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} size='small'>
            <Column field="Ten_thanh_pham" header="Tên"></Column>
            <Column field="Don_vi_tinh" header="Đơn vị tính"></Column>
            <Column field="Gia_ban" header="Giá bán"></Column>
            <Column field="So_luong" header="Số lượng"></Column>
            <Column body={actionBodyTemplate} header="Thao tác" style={{ minWidth: '15rem' }} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default ThanhPhamPage;
