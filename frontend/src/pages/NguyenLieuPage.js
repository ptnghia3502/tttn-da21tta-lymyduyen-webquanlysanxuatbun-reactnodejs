import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const NguyenLieuPage = () => {
    const [nguyenlieu, setNguyenLieu] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await axios.get('http://localhost:5000/nguyenlieu');
        setNguyenLieu(res.data);
    };

    return (
        <div>
            <h2>Quản lý Nguyên liệu</h2>
            <Button label="Thêm Nguyên liệu" />
            <DataTable value={nguyenlieu}>
                <Column field="maNguyenLieu" header="Mã Nguyên Liệu" />
                <Column field="tenNguyenLieu" header="Tên Nguyên Liệu" />
                <Column field="soLuongTon" header="Số Lượng Tồn" />
            </DataTable>
        </div>
    );
};

export default NguyenLieuPage;
