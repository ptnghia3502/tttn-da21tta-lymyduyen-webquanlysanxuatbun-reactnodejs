'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import NguyenLieuService from '../../services/nguyenlieuService';
import NguyenLieuModal from '../../modal/NguyenLieuModal';

const NguyenLieuPage = () => {
    const [dataList, setDataList] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [formData, setFormData] = useState({
        ten: '',
        loai: '',
        so_luong: 0,
        don_vi: '',
        trang_thai: ''
    });

    const toast = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await NguyenLieuService.getAll();
            setDataList(Array.isArray(response.DT) ? response.DT : []);
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
        setFormData({ ten: '', loai: '', so_luong: 0, don_vi: '', trang_thai: '' });
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
            await NguyenLieuService.delete(id);
            fetchData();
            showSuccess('Xóa thành công');
        } catch (error) {
            showError('Lỗi khi xóa');
        }
    };

    const saveData = async () => {
        try {
            if (isNew) {
                await NguyenLieuService.create(formData);
            } else {
                await NguyenLieuService.update(formData.id, formData);
            }
            fetchData();
            setDisplayDialog(false);
            showSuccess(isNew ? 'Thêm mới thành công' : 'Cập nhật thành công');
        } catch (error) {
            showError(isNew ? 'Lỗi khi thêm mới' : 'Lỗi khi cập nhật');
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
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
                    <h1>Quản Lý Nguyên Liệu</h1>
                    <div style={{ marginBottom: '10px' }}>
                        <Button label="Thêm mới" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
                    </div>
                    <DataTable value={dataList} paginator rows={10} rowsPerPageOptions={[5, 10, 25]}>
                        <Column field="ten" header="Tên"></Column>
                        <Column field="loai" header="Loại"></Column>
                        <Column field="so_luong" header="Số Lượng"></Column>
                        <Column field="don_vi" header="Đơn Vị"></Column>
                        <Column field="trang_thai" header="Trạng Thái"></Column>
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

export default NguyenLieuPage;
