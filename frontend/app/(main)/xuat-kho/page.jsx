'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import XuatKhoService from '../../services/xuatKhoService.mjs';
import XuatKhoEditModal from '../../modal/XuatKhoEditModal';

const XuatKhoPage = () => {
  const [xuatKhoList, setXuatKhoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayDetailModal, setDisplayDetailModal] = useState(false);
  const [displayEditModal, setDisplayEditModal] = useState(false);
  const [selectedXuatKho, setSelectedXuatKho] = useState(null);
  const [selectedXuatKhoId, setSelectedXuatKhoId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1
  });

  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    loadXuatKhoList();
  }, [lazyParams]);

  const loadXuatKhoList = async () => {
    try {
      setLoading(true);
      const { page, rows } = lazyParams;
      const result = await XuatKhoService.getAll({
        page: page,
        limit: rows
      });

      if (result.success) {
        setXuatKhoList(result.data);
        setTotalRecords(result.pagination?.total || 0);
      } else {
        showError(result.message || 'Không thể tải danh sách phiếu xuất kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi tải danh sách phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const onPage = (event) => {
    setLazyParams({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: event.page + 1
    });
  };

  const showSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
  };

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Lỗi', detail: message, life: 3000 });
  };

  const openEdit = (id) => {
    setSelectedXuatKhoId(id);
    setDisplayEditModal(true);
  };

  const viewDetails = async (id) => {
    try {
      setLoading(true);
      const result = await XuatKhoService.getById(id);
      
      if (result.success) {
        setSelectedXuatKho(result.data);
        setDisplayDetailModal(true);
      } else {
        showError(result.message || 'Không thể tải chi tiết phiếu xuất kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi tải chi tiết phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteXuatKho = (id) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa phiếu xuất kho này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => deleteXuatKho(id)
    });
  };

  const deleteXuatKho = async (id) => {
    try {
      setLoading(true);
      const result = await XuatKhoService.delete(id);
      
      if (result.success) {
        showSuccess('Xóa phiếu xuất kho thành công');
        loadXuatKhoList();
      } else {
        showError(result.message || 'Không thể xóa phiếu xuất kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi xóa phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    
    const date = new Date(value);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  };

  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.Ngay_xuat);
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.Tong_tien);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => viewDetails(rowData.Id)} />
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEdit(rowData.Id)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteXuatKho(rowData.Id)} />
      </div>
    );
  };

  const detailDialogFooter = (
    <div>
      <Button label="Đóng" icon="pi pi-times" onClick={() => setDisplayDetailModal(false)} className="p-button-text" />
    </div>
  );

  const renderDetailDialog = () => {
    if (!selectedXuatKho) return null;

    return (
      <Dialog
        header="Chi tiết phiếu xuất kho"
        visible={displayDetailModal} 
        style={{ width: '80vw' }} 
        footer={detailDialogFooter}
        onHide={() => setDisplayDetailModal(false)}
      >
        <div className="grid formgrid">
          <div className="field col-12 md:col-4">
            <label htmlFor="ma">Mã phiếu</label>
            <InputText id="ma" value={selectedXuatKho?.Ma_xuat_kho || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="date">Ngày xuất</label>
            <InputText id="date" value={formatDate(selectedXuatKho?.Ngay_xuat) || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="user">Người xuất</label>
            <InputText id="user" value={selectedXuatKho?.Nguoi_xuat || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="total">Tổng tiền</label>
            <InputText id="total" value={formatCurrency(selectedXuatKho?.Tong_tien) || ''} readOnly />
          </div>
          <div className="field col-12 md:col-8">
            <label htmlFor="ghichu">Ghi chú</label>
            <InputTextarea id="ghichu" value={selectedXuatKho?.Ghi_chu || ''} readOnly rows={2} />
          </div>
        </div>
        
        <h2>Chi tiết xuất kho</h2>
        <DataTable value={selectedXuatKho?.chi_tiet || []} emptyMessage="Không có chi tiết">
          <Column field="Ten_thanh_pham" header="Tên thành phẩm" />
          <Column field="So_luong" header="Số lượng" />
          <Column field="Don_vi_tinh" header="Đơn vị tính" />
          <Column field="Don_gia" header="Đơn giá" body={(rowData) => formatCurrency(rowData.Don_gia)} />
          <Column field="Thanh_tien" header="Thành tiền" body={(rowData) => formatCurrency(rowData.Thanh_tien)} />
        </DataTable>
      </Dialog>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <h1>Danh sách phiếu xuất kho</h1>
      
      <DataTable
        ref={dt}
        value={xuatKhoList}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage="Không tìm thấy phiếu xuất kho nào"
        responsiveLayout="scroll"
      >
        <Column field="Ma_xuat_kho" header="Mã phiếu" />
        <Column field="Ngay_xuat" header="Ngày xuất" body={dateBodyTemplate} />
        <Column field="Nguoi_xuat" header="Người xuất" />
        <Column field="Tong_tien" header="Tổng tiền" body={priceBodyTemplate} />
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
      </DataTable>

      <XuatKhoEditModal
        visible={displayEditModal}
        onHide={() => setDisplayEditModal(false)}
        onSuccess={() => {
          loadXuatKhoList();
          setDisplayEditModal(false);
        }}
        toast={toast}
        xuatKhoId={selectedXuatKhoId}
      />
      
      {renderDetailDialog()}
    </div>
  );
};

export default XuatKhoPage; 