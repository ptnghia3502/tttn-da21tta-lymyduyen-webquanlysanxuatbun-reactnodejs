'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import CongThucService from '../../services/congThucService';
import ThanhPhamService from '../../services/thanhphamService';
import CongThucModal from '../../modal/CongThucModal';

const CongThucPage = () => {
  const [congThucList, setCongThucList] = useState([]);
  const [thanhPhamList, setThanhPhamList] = useState([]);
  const [selectedThanhPham, setSelectedThanhPham] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [displayCongThucModal, setDisplayCongThucModal] = useState(false);
  const [selectedCongThucId, setSelectedCongThucId] = useState(null);
  const [loading, setLoading] = useState(false);

  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    fetchThanhPham();
  }, []);

  useEffect(() => {
    if (selectedThanhPham) {
      fetchCongThuc(selectedThanhPham.Id);
    } else {
      setCongThucList([]);
    }
  }, [selectedThanhPham]);

  const fetchThanhPham = async () => {
    setLoading(true);
    try {
      const response = await ThanhPhamService.getAll();
      console.log('Response thành phẩm:', response);
      if (response.success) {
        setThanhPhamList(response.data || []);
      } else {
        console.error('Không thể lấy danh sách thành phẩm:', response);
        setThanhPhamList([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành phẩm:', error);
      showError('Không thể tải danh sách thành phẩm');
    }
    setLoading(false);
  };

  const fetchCongThuc = async (thanhPhamId) => {
    setLoading(true);
    try {
      const response = await CongThucService.getByThanhPhamId(thanhPhamId);
      console.log('Response công thức:', response);
      if (response.success) {
        // Xử lý dữ liệu nếu API trả về định dạng khác
        if (response.data && Array.isArray(response.data)) {
          // Kiểm tra xem mỗi công thức có nguyen_lieu là chuỗi không
          const processedData = response.data.map(item => {
            if (item.nguyen_lieu && typeof item.nguyen_lieu === 'string') {
              try {
                // Thử parse chuỗi thành JSON
                item.nguyen_lieu = JSON.parse(item.nguyen_lieu);
              } catch (e) {
                console.warn('Không thể parse chuỗi nguyên liệu:', e);
                item.nguyen_lieu = [];
              }
            }
            return item;
          });
          setCongThucList(processedData);
        } else {
          setCongThucList(response.data || []);
        }
      } else {
        console.error('Không thể lấy danh sách công thức:', response);
        setCongThucList([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách công thức:', error);
      showError('Không thể tải danh sách công thức');
    }
    setLoading(false);
  };

  const showSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 });
  };

  const showError = (message) => {
    toast.current.show({ severity: 'error', summary: 'Lỗi', detail: message, life: 3000 });
  };

  const handleThanhPhamChange = (e) => {
    setSelectedThanhPham(e.value);
  };

  const openNew = () => {
    setSelectedCongThucId(null);
    setDisplayCongThucModal(true);
  };

  const editCongThuc = (congThucId) => {
    setSelectedCongThucId(congThucId);
    setDisplayCongThucModal(true);
  };

  const confirmDeleteCongThuc = (congThucId) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa công thức này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteCongThuc(congThucId),
      reject: () => {}
    });
  };

  const deleteCongThuc = async (congThucId) => {
    try {
      await CongThucService.delete(selectedThanhPham.Id, congThucId);
      fetchCongThuc(selectedThanhPham.Id);
      showSuccess('Xóa công thức thành công');
    } catch (error) {
      console.error('Lỗi khi xóa công thức:', error);
      showError('Lỗi khi xóa công thức');
    }
  };

  const onCongThucSuccess = () => {
    fetchCongThuc(selectedThanhPham.Id);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCongThuc(rowData.Id)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteCongThuc(rowData.Id)} />
      </div>
    );
  };

  const nguyenLieuBodyTemplate = (rowData) => {
    if (!rowData.nguyen_lieu || !Array.isArray(rowData.nguyen_lieu) || rowData.nguyen_lieu.length === 0) {
      return <span className="text-gray-500">Không có nguyên liệu</span>;
    }

    return (
      <ul className="list-none p-0 m-0">
        {rowData.nguyen_lieu.map((nl, index) => (
          <li key={index} className="mb-1">
            {nl.Ten_nguyen_lieu}: {nl.So_luong_can} {nl.Don_vi_tinh}
          </li>
        ))}
      </ul>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Quản lý công thức</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm..."
        />
      </span>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="grid">
        <div className="col-12 md:col-4 mb-3">
          <label htmlFor="thanhPham" className="block mb-1 font-bold">Chọn thành phẩm</label>
          <Dropdown
            id="thanhPham"
            value={selectedThanhPham}
            options={thanhPhamList}
            onChange={handleThanhPhamChange}
            optionLabel="Ten_thanh_pham"
            placeholder="Chọn thành phẩm"
            className="w-full"
          />
        </div>

        <div className="col-12 text-right mb-3">
          <Button
            label="Thêm công thức mới"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openNew}
            disabled={!selectedThanhPham}
          />
        </div>

        <div className="col-12">
          <DataTable
            ref={dt}
            value={congThucList}
            dataKey="Id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            globalFilter={globalFilter}
            emptyMessage="Chưa có công thức nào"
            header={header}
            loading={loading}
            responsiveLayout="scroll"
          >
            <Column field="Ten_cong_thuc" header="Tên công thức" sortable />
            <Column field="Ten_thanh_pham" header="Thành phẩm" sortable />
            <Column body={nguyenLieuBodyTemplate} header="Nguyên liệu" />
            <Column body={actionBodyTemplate} headerStyle={{ width: '8rem' }} />
          </DataTable>
        </div>
      </div>

      {displayCongThucModal && (
        <CongThucModal
          visible={displayCongThucModal}
          thanhPhamId={selectedThanhPham?.Id}
          congThucId={selectedCongThucId}
          onHide={() => setDisplayCongThucModal(false)}
          onSuccess={onCongThucSuccess}
        />
      )}
    </div>
  );
};

export default CongThucPage; 