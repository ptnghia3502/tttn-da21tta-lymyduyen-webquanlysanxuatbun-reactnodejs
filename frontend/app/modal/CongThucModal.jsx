import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import CongThucService from '../services/congThucService';
import NguyenVatLieuService from '../services/nguyenvatlieuService';
import ThanhPhamService from '../services/thanhphamService';

function CongThucModal({ visible, thanhPhamId, congThucId, onHide, onSuccess }) {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    Ten_cong_thuc: '',
    Mo_ta: '',
    nguyen_lieu: []
  });
  const [nguyenLieuList, setNguyenLieuList] = useState([]);
  const [selectedNguyenLieu, setSelectedNguyenLieu] = useState(null);
  const [soLuongCan, setSoLuongCan] = useState('');
  const [donViTinh, setDonViTinh] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin thành phẩm
        if (thanhPhamId) {
          const thanhPhamResponse = await ThanhPhamService.getById(thanhPhamId);
          if (thanhPhamResponse && thanhPhamResponse.success && thanhPhamResponse.data) {
            const tenThanhPham = thanhPhamResponse.data.Ten_thanh_pham;
            // Nếu là thêm mới công thức, set tên mặc định
            if (!congThucId) {
              setFormData(prev => ({
                ...prev,
                Ten_cong_thuc: `Công thức ${tenThanhPham}`
              }));
            }
          }
        }

        // Lấy danh sách nguyên liệu
        console.log('Đang lấy danh sách nguyên vật liệu...');
        const nguyenLieuResponse = await NguyenVatLieuService.getAll();
        console.log('Kết quả API nguyên vật liệu:', nguyenLieuResponse);
        
        if (nguyenLieuResponse && nguyenLieuResponse.success) {
          console.log('Số lượng nguyên vật liệu nhận được:', nguyenLieuResponse.data?.length);
          setNguyenLieuList(nguyenLieuResponse.data || []);
        } else {
          console.error('API nguyên vật liệu không trả về success=true');
          setNguyenLieuList([]);
        }

        // Nếu là chỉnh sửa công thức, lấy dữ liệu công thức
        if (congThucId) {
          console.log(`Đang lấy chi tiết công thức ID=${congThucId} cho thành phẩm ID=${thanhPhamId}...`);
          const response = await CongThucService.getById(thanhPhamId, congThucId);
          console.log('Kết quả API chi tiết công thức:', response);
          
          if (response && response.success && response.data) {
            // Gom nhóm nguyên liệu theo ID nếu API trả về nhiều bản ghi cho cùng 1 công thức
            const groupedData = {
              Ten_cong_thuc: response.data[0]?.Ten_cong_thuc || '',
              Mo_ta: response.data[0]?.Mo_ta || '',
              nguyen_lieu: []
            };

            // Chuyển đổi dữ liệu chi tiết nguyên liệu
            response.data.forEach(item => {
              if (item.Nguyen_vat_lieu_id) {
                groupedData.nguyen_lieu.push({
                  Nguyen_vat_lieu_id: item.Nguyen_vat_lieu_id,
                  Ten_nguyen_lieu: item.Ten_nguyen_lieu,
                  So_luong_can: item.So_luong_can,
                  Don_vi_tinh: item.Don_vi_tinh
                });
              }
            });

            setFormData(groupedData);
          }
        } else {
          // Reset form khi thêm mới (ngoại trừ Ten_cong_thuc đã được set ở trên)
          setFormData(prev => ({
            ...prev,
            Mo_ta: '',
            nguyen_lieu: []
          }));
        }
      } catch (error) {
        console.error('Lỗi chi tiết khi tải dữ liệu:', error);
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
        }
        setError('Lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      }
      setLoading(false);
    };

    if (visible) {
      fetchData();
    }
  }, [visible, thanhPhamId, congThucId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNguyenLieu = () => {
    if (!selectedNguyenLieu) {
      showMessage('error', 'Vui lòng chọn nguyên liệu');
      return;
    }
    
    if (!soLuongCan || parseFloat(soLuongCan) <= 0) {
      showMessage('error', 'Số lượng cần phải lớn hơn 0');
      return;
    }
    
    if (!donViTinh) {
      showMessage('error', 'Vui lòng nhập đơn vị tính');
      return;
    }
    
    // Kiểm tra nguyên liệu đã tồn tại trong danh sách chưa
    const exists = formData.nguyen_lieu.some(item => 
      item.Nguyen_vat_lieu_id === selectedNguyenLieu.Id
    );
    
    if (exists) {
      showMessage('error', 'Nguyên liệu này đã được thêm vào công thức');
      return;
    }
    
    const newNguyenLieu = {
      Nguyen_vat_lieu_id: selectedNguyenLieu.Id,
      Ten_nguyen_lieu: selectedNguyenLieu.Ten_nguyen_lieu,
      So_luong_can: parseFloat(soLuongCan),
      Don_vi_tinh: donViTinh
    };
    
    setFormData(prev => ({
      ...prev,
      nguyen_lieu: [...prev.nguyen_lieu, newNguyenLieu]
    }));
    
    // Reset form
    setSelectedNguyenLieu(null);
    setSoLuongCan('');
    setDonViTinh('');
  };

  const removeNguyenLieu = (index) => {
    setFormData(prev => ({
      ...prev,
      nguyen_lieu: prev.nguyen_lieu.filter((_, i) => i !== index)
    }));
  };

  const showMessage = (severity, detail) => {
    toast.current?.show({
      severity: severity,
      summary: severity === 'error' ? 'Lỗi' : 'Thông báo',
      detail: detail,
      life: 3000
    });
  };

  const handleSubmit = async () => {
    // Validate dữ liệu
    if (!formData.Ten_cong_thuc.trim()) {
      setError('Vui lòng nhập tên công thức');
      return;
    }
    
    if (formData.nguyen_lieu.length === 0) {
      setError('Công thức phải có ít nhất một nguyên liệu');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        Ten_cong_thuc: formData.Ten_cong_thuc,
        Mo_ta: formData.Mo_ta,
        nguyen_lieu: formData.nguyen_lieu.map(item => ({
          Nguyen_vat_lieu_id: item.Nguyen_vat_lieu_id,
          So_luong_can: item.So_luong_can,
          Don_vi_tinh: item.Don_vi_tinh
        }))
      };
      
      if (congThucId) {
        await CongThucService.update(thanhPhamId, congThucId, payload);
        showMessage('success', 'Cập nhật công thức thành công');
      } else {
        await CongThucService.create(thanhPhamId, payload);
        showMessage('success', 'Thêm công thức thành công');
      }
      
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Lỗi khi lưu công thức:', error);
      setError('Lỗi khi lưu công thức. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={congThucId ? "Cập nhật công thức" : "Thêm công thức mới"}
      modal
      className="p-fluid"
      style={{ width: '700px' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Hủy" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Lưu" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} loading={loading} />
        </div>
      }
    >
      <Toast ref={toast} />
      
      <div className="grid">
        <div className="col-12 mb-2">
          <label htmlFor="Ten_cong_thuc" className="font-bold block mb-1">
            Tên công thức <span className="text-red-500">*</span>
          </label>
          <InputText id="Ten_cong_thuc" name="Ten_cong_thuc" value={formData.Ten_cong_thuc} onChange={handleChange} className="w-full" />
        </div>
        
        <div className="col-12 mb-2">
          <label htmlFor="Mo_ta" className="font-bold block mb-1">
            Mô tả
          </label>
          <InputTextarea id="Mo_ta" name="Mo_ta" value={formData.Mo_ta} onChange={handleChange} rows={3} className="w-full" />
        </div>
        
        <div className="col-12">
          <div className="p-card p-3 mb-3">
            <h3 className="mt-0 mb-3">Thêm nguyên liệu vào công thức</h3>
            <div className="grid">
              <div className="col-4">
                <label className="font-bold block mb-1">Nguyên liệu <span className="text-red-500">*</span></label>
                <Dropdown
                  value={selectedNguyenLieu}
                  options={nguyenLieuList}
                  onChange={(e) => setSelectedNguyenLieu(e.value)}
                  optionLabel="Ten_nguyen_lieu"
                  filter
                  showClear
                  placeholder="Chọn nguyên liệu"
                  className="w-full"
                />
              </div>
              
              <div className="col-3">
                <label className="font-bold block mb-1">Số lượng <span className="text-red-500">*</span></label>
                <InputText
                  value={soLuongCan}
                  onChange={(e) => setSoLuongCan(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="Số lượng"
                  className="w-full"
                />
              </div>
              
              <div className="col-3">
                <label className="font-bold block mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                <InputText
                  value={donViTinh}
                  onChange={(e) => setDonViTinh(e.target.value)}
                  placeholder="Đơn vị tính"
                  className="w-full"
                />
              </div>
              
              <div className="col-2 flex align-items-end">
                <Button label="Thêm" icon="pi pi-plus" onClick={addNguyenLieu} className="w-full" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12">
          <h3 className="mt-0 mb-3">Danh sách nguyên liệu trong công thức</h3>
          <DataTable value={formData.nguyen_lieu} emptyMessage="Chưa có nguyên liệu nào trong công thức" size="small">
            <Column field="Ten_nguyen_lieu" header="Tên nguyên liệu" />
            <Column field="So_luong_can" header="Số lượng" />
            <Column field="Don_vi_tinh" header="Đơn vị tính" />
            <Column
              body={(rowData, { rowIndex }) => (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger p-button-sm"
                  onClick={() => removeNguyenLieu(rowIndex)}
                />
              )}
              header="Xóa"
              style={{ width: '80px', textAlign: 'center' }}
            />
          </DataTable>
        </div>
        
        {error && (
          <div className="col-12 mt-3">
            <Message severity="error" text={error} className="w-full" />
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default CongThucModal;