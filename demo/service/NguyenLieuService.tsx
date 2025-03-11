import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import axios from 'axios';

const NguyenLieuService = () => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        axios.get('/api/materials')
            .then(response => setMaterials(response.data))
            .catch(error => console.error('Lỗi khi tải nguyên liệu:', error));
    }, []);

    return (
        <div>
            <h2>Quản lý Nguyên Liệu</h2>
            <Button label="Nhập Nguyên Liệu" icon="pi pi-plus" className="p-button-success mb-3" />
            <DataTable value={materials} paginator rows={10} responsiveLayout="scroll">
                <Column field="name" header="Tên Nguyên Liệu" sortable />
                <Column field="quantity" header="Số Lượng" sortable />
                <Column field="unit" header="Đơn Vị" />
                <Column field="supplier" header="Nhà Cung Cấp" />
            </DataTable>
        </div>
    );
};

export default NguyenLieuService;
