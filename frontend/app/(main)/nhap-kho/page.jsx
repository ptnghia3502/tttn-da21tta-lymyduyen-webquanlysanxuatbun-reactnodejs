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
import NhapKhoService from '../../services/nhapKhoService.mjs';
import NhapKhoEditModal from '../../modal/NhapKhoEditModal';

const NhapKhoPage = () => {
  const [nhapKhoList, setNhapKhoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayDetailModal, setDisplayDetailModal] = useState(false);
  const [displayEditModal, setDisplayEditModal] = useState(false);
  const [selectedNhapKho, setSelectedNhapKho] = useState(null);
  const [selectedNhapKhoId, setSelectedNhapKhoId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1
  });

  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    loadNhapKhoList();
  }, [lazyParams]);

  const loadNhapKhoList = async () => {
    try {
      setLoading(true);
      const { page, rows } = lazyParams;
      const result = await NhapKhoService.getAll({
        page: page,
        limit: rows
      });

      if (result.success) {
        setNhapKhoList(result.data);
        setTotalRecords(result.pagination?.total || 0);
      } else {
        showError(result.message || 'Không thể tải danh sách phiếu nhập kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi tải danh sách phiếu nhập kho');
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
    setSelectedNhapKhoId(id);
    setDisplayEditModal(true);
  };

  const viewDetails = async (id) => {
    try {
      setLoading(true);
      const result = await NhapKhoService.getById(id);
      
      if (result.success) {
        setSelectedNhapKho(result.data);
        setDisplayDetailModal(true);
      } else {
        showError(result.message || 'Không thể tải chi tiết phiếu nhập kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi tải chi tiết phiếu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteNhapKho = (id) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa phiếu nhập kho này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => deleteNhapKho(id)
    });
  };

  const deleteNhapKho = async (id) => {
    try {
      setLoading(true);
      const result = await NhapKhoService.delete(id);
      
      if (result.success) {
        showSuccess('Xóa phiếu nhập kho thành công');
        loadNhapKhoList();
      } else {
        showError(result.message || 'Không thể xóa phiếu nhập kho');
      }
    } catch (error) {
      console.error(error);
      showError('Lỗi khi xóa phiếu nhập kho');
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
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.Ngay_nhap);
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.Tong_tien);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" onClick={() => viewDetails(rowData.Id)} />
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEdit(rowData.Id)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteNhapKho(rowData.Id)} />
      </div>
    );
  };

  const detailDialogFooter = (
    <div>
      <Button label="Đóng" icon="pi pi-times" onClick={() => setDisplayDetailModal(false)} className="p-button-text" />
    </div>
  );

  const renderDetailDialog = () => {
    if (!selectedNhapKho) return null;

    return (
      <Dialog
        header="Chi tiết phiếu nhập kho"
        visible={displayDetailModal} 
        style={{ width: '80vw' }} 
        footer={detailDialogFooter}
        onHide={() => setDisplayDetailModal(false)}
      >
        <div className="grid formgrid">
          <div className="field col-12 md:col-4">
            <label htmlFor="ma">Mã phiếu</label>
            <InputText id="ma" value={selectedNhapKho?.Ma_nhap_kho || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="date">Ngày nhập</label>
            <InputText id="date" value={formatDate(selectedNhapKho?.Ngay_nhap) || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="user">Người nhập</label>
            <InputText id="user" value={selectedNhapKho?.Nguoi_nhap || ''} readOnly />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="total">Tổng tiền</label>
            <InputText id="total" value={formatCurrency(selectedNhapKho?.Tong_tien) || ''} readOnly />
          </div>
          <div className="field col-12 md:col-8">
            <label htmlFor="ghichu">Ghi chú</label>
            <InputTextarea id="ghichu" value={selectedNhapKho?.Ghi_chu || ''} readOnly rows={2} />
          </div>
        </div>
        
        <h2>Chi tiết nhập kho</h2>
        <DataTable value={selectedNhapKho?.chi_tiet || []} emptyMessage="Không có chi tiết">
          <Column field="Ten_nguyen_lieu" header="Tên nguyên vật liệu" />
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
      
      <h1>Danh sách phiếu nhập kho</h1>
      
      <DataTable
        ref={dt}
        value={nhapKhoList}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage="Không tìm thấy phiếu nhập kho nào"
        responsiveLayout="scroll"
      >
        <Column field="Ma_nhap_kho" header="Mã phiếu" />
        <Column field="Ngay_nhap" header="Ngày nhập" body={dateBodyTemplate} />
        <Column field="Nguoi_nhap" header="Người nhập" />
        <Column field="Tong_tien" header="Tổng tiền" body={priceBodyTemplate} />
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
      </DataTable>

      <NhapKhoEditModal
        visible={displayEditModal}
        onHide={() => setDisplayEditModal(false)}
        onSuccess={() => {
          loadNhapKhoList();
          setDisplayEditModal(false);
        }}
        toast={toast}
        nhapKhoId={selectedNhapKhoId}
      />
      
      {renderDetailDialog()}
    </div>
  );
};

export default NhapKhoPage; 