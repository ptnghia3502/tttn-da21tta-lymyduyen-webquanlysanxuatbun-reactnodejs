import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CongThucService from '../services/congThucService';
import NguyenVatLieuService from '../services/nguyenvatlieuService';

function SanXuatModal({ visible, thanhPhamId, thanhPhamName, onHide, onSuccess }) {
  const toast = useRef(null);
  const [congThucList, setCongThucList] = useState([]);
  const [selectedCongThuc, setSelectedCongThuc] = useState(null);
  const [soLuong, setSoLuong] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingMaterials, setCheckingMaterials] = useState(false);
  const [materialStatus, setMaterialStatus] = useState([]);
  const [showMaterialStatus, setShowMaterialStatus] = useState(false);

  // Lấy danh sách công thức khi mở modal
  useEffect(() => {
    const fetchCongThuc = async () => {
      if (!visible || !thanhPhamId) return;
      
      setLoading(true);
      try {
        const response = await CongThucService.getByThanhPhamId(thanhPhamId);
        if (response.success) {
          setCongThucList(response.data || []);
        } else {
          setCongThucList([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách công thức:', error);
        setError('Không thể tải danh sách công thức');
      }
      setLoading(false);
    };

    fetchCongThuc();
  }, [visible, thanhPhamId]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!visible) {
      setSelectedCongThuc(null);
      setSoLuong('');
      setError('');
      setMaterialStatus([]);
      setShowMaterialStatus(false);
    }
  }, [visible]);

  const handleChangeSoLuong = (e) => {
    setSoLuong(e.target.value);
  };

  const showMessage = (severity, detail) => {
    toast.current?.show({
      severity: severity,
      summary: severity === 'error' ? 'Lỗi' : 'Thông báo',
      detail: detail,
      life: 3000
    });
  };

  // Kiểm tra nguyên liệu đủ không
  const checkMaterials = async () => {
    if (!selectedCongThuc) {
      setError('Vui lòng chọn công thức sản xuất');
      return false;
    }
    
    if (!soLuong || parseInt(soLuong) <= 0) {
      setError('Số lượng sản xuất phải lớn hơn 0');
      return false;
    }
    
    setCheckingMaterials(true);
    setShowMaterialStatus(true);
    
    try {
      // Lấy chi tiết công thức và tính toán nguyên liệu cần
      console.log(`Kiểm tra nguyên liệu cho công thức ID=${selectedCongThuc.Id}, thành phẩm ID=${thanhPhamId}`);
      const congThucDetail = await CongThucService.getById(thanhPhamId, selectedCongThuc.Id);
      console.log('Chi tiết công thức từ API:', congThucDetail);
      
      if (congThucDetail.success && Array.isArray(congThucDetail.data)) {
        // Lấy dữ liệu nguyên liệu từ công thức
        let nguyenLieuList = congThucDetail.data.filter(item => item.Nguyen_vat_lieu_id);
        console.log('Nguyên liệu từ data (cách 1):', nguyenLieuList);
        
        // Nếu không có nguyên liệu trực tiếp, kiểm tra xem có trường nguyen_lieu không
        if (nguyenLieuList.length === 0 && congThucDetail.data.length > 0 && congThucDetail.data[0].nguyen_lieu) {
          // Nếu nguyen_lieu là chuỗi, thử parse
          let nguyenLieu = congThucDetail.data[0].nguyen_lieu;
          console.log('Dữ liệu nguyên liệu thô:', nguyenLieu, 'Kiểu:', typeof nguyenLieu);
          
          if (typeof nguyenLieu === 'string') {
            try {
              console.log('Thử parse chuỗi nguyên liệu');
              nguyenLieu = JSON.parse(nguyenLieu);
              console.log('Kết quả parse:', nguyenLieu);
            } catch (e) {
              console.error('Lỗi khi parse chuỗi nguyên liệu:', e);
            }
          }
          
          // Nếu là mảng, dùng nó
          if (Array.isArray(nguyenLieu)) {
            console.log('Nguyên liệu từ data (cách 2):', nguyenLieu);
            nguyenLieuList = nguyenLieu;
          }
        }
        
        console.log('Danh sách nguyên liệu cuối cùng cần kiểm tra:', nguyenLieuList);
        
        if (nguyenLieuList.length === 0) {
          setError('Công thức này không có nguyên liệu nào');
          setCheckingMaterials(false);
          return false;
        }
        
        // Lấy chi tiết của từng nguyên liệu để kiểm tra số lượng tồn
        console.log('Bắt đầu lấy thông tin chi tiết về nguyên liệu...');
        const nguyenLieuDetails = await Promise.all(
          nguyenLieuList.map(async (item) => {
            const nvlId = item.Nguyen_vat_lieu_id || item.Id; // Tùy thuộc vào cấu trúc dữ liệu
            console.log(`Đang lấy chi tiết nguyên liệu ID=${nvlId}`);
            try {
              const response = await NguyenVatLieuService.getById(nvlId);
              console.log(`Chi tiết nguyên liệu ID ${nvlId}:`, response);
              return response.success ? response.data : null;
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin nguyên liệu ID ${nvlId}:`, error);
              if (error.response) {
                console.error('Response error:', error.response.status, error.response.data);
              }
              return null;
            }
          })
        );
        
        // Tạo danh sách trạng thái nguyên liệu
        console.log('Kết quả lấy thông tin chi tiết nguyên liệu:', nguyenLieuDetails);
        const status = nguyenLieuList.map((item, index) => {
          const soLuongCan = parseFloat(item.So_luong_can || 0);
          const requiredAmount = soLuongCan * parseInt(soLuong);
          const nguyenLieuDetail = nguyenLieuDetails[index];
          
          // Nếu không lấy được thông tin chi tiết, giả định là không đủ
          if (!nguyenLieuDetail) {
            console.log(`Không tìm thấy thông tin chi tiết cho nguyên liệu ${item.Ten_nguyen_lieu || 'ID: ' + (item.Nguyen_vat_lieu_id || item.Id)}`);
            return {
              id: item.Nguyen_vat_lieu_id || item.Id,
              ten: item.Ten_nguyen_lieu || 'Không xác định',
              requiredAmount: requiredAmount.toFixed(2),
              availableAmount: '0',
              donViTinh: item.Don_vi_tinh || '',
              isAvailable: false
            };
          }
          
          const availableAmount = parseFloat(nguyenLieuDetail.So_luong_ton || 0);
          const isAvailable = availableAmount >= requiredAmount;
          
          console.log(`Nguyên liệu ${nguyenLieuDetail.Ten_nguyen_lieu}: Cần ${requiredAmount}, Có ${availableAmount}, Đủ: ${isAvailable}`);
          
          return {
            id: item.Nguyen_vat_lieu_id || item.Id,
            ten: item.Ten_nguyen_lieu || nguyenLieuDetail.Ten_nguyen_lieu,
            requiredAmount: requiredAmount.toFixed(2),
            availableAmount: availableAmount.toFixed(2),
            donViTinh: item.Don_vi_tinh || nguyenLieuDetail.Don_vi_tinh,
            isAvailable: isAvailable
          };
        });
        
        setMaterialStatus(status);
        
        // Kiểm tra tất cả nguyên liệu có đủ không
        const allAvailable = status.every(item => item.isAvailable);
        console.log(`Kết quả kiểm tra nguyên liệu: Đủ=${allAvailable}`);
        setCheckingMaterials(false);
        
        return allAvailable;
      } else {
        console.error('API công thức không trả về dữ liệu hợp lệ:', congThucDetail);
        setError('Không thể lấy thông tin chi tiết công thức');
        setCheckingMaterials(false);
        return false;
      }
    } catch (error) {
      console.error('Lỗi chi tiết khi kiểm tra nguyên liệu:', error);
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      }
      showMessage('error', 'Lỗi khi kiểm tra nguyên liệu');
      setCheckingMaterials(false);
      return false;
    }
  };

  const handleSanXuat = async () => {
    // Validate dữ liệu
    if (!selectedCongThuc) {
      setError('Vui lòng chọn công thức sản xuất');
      return;
    }
    
    if (!soLuong || parseInt(soLuong) <= 0) {
      setError('Số lượng sản xuất phải lớn hơn 0');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Kiểm tra nguyên liệu trước khi sản xuất
      const materialsAvailable = await checkMaterials();
      
      if (materialsAvailable) {
        // Gọi API sản xuất
        const payload = {
          Cong_thuc_id: selectedCongThuc.Id,
          So_luong: parseInt(soLuong)
        };
        
        console.log('Dữ liệu sản xuất gửi đi:', payload);
        
        const response = await CongThucService.sanXuat(thanhPhamId, payload);
        console.log('Kết quả sản xuất:', response);
        
        if (response && (response.success || response.message)) {
          showMessage('success', 'Sản xuất thành phẩm thành công');
          onSuccess();
          onHide();
        } else {
          setError(response?.message || 'Lỗi khi sản xuất thành phẩm');
        }
      } else {
        setError('Không đủ nguyên liệu để sản xuất');
      }
    } catch (error) {
      console.error('Lỗi khi sản xuất:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi sản xuất thành phẩm';
      setError('Lỗi khi sản xuất thành phẩm: ' + errorMessage);
    }
    
    setLoading(false);
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Sản xuất thành phẩm: ${thanhPhamName || ''}`}
      modal
      className="p-fluid"
      style={{ width: '600px' }}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Hủy" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button 
            label="Sản xuất" 
            icon="pi pi-check" 
            className="p-button-primary" 
            onClick={handleSanXuat} 
            loading={loading || checkingMaterials}
            disabled={!selectedCongThuc || !soLuong || parseInt(soLuong) <= 0}
          />
        </div>
      }
    >
      <Toast ref={toast} />
      
      <div className="grid">
        <div className="col-12 mb-3">
          <label htmlFor="congThuc" className="font-bold block mb-1">
            Công thức sản xuất <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="congThuc"
            value={selectedCongThuc}
            options={congThucList}
            onChange={(e) => setSelectedCongThuc(e.value)}
            optionLabel="Ten_cong_thuc"
            placeholder="Chọn công thức sản xuất"
            className="w-full"
            emptyMessage={loading ? "Đang tải..." : "Không có công thức nào"}
          />
        </div>
        
        <div className="col-12 mb-3">
          <label htmlFor="soLuong" className="font-bold block mb-1">
            Số lượng sản xuất <span className="text-red-500">*</span>
          </label>
          <InputText
            id="soLuong"
            value={soLuong}
            onChange={handleChangeSoLuong}
            placeholder="Nhập số lượng cần sản xuất"
            type="number"
            min="1"
            className="w-full"
          />
        </div>
        
        {showMaterialStatus && (
          <div className="col-12 mt-2">
            <h3 className="mt-0 mb-2">Kiểm tra nguyên liệu</h3>
            {checkingMaterials ? (
              <div className="center">Đang kiểm tra nguyên liệu...</div>
            ) : (
              <DataTable value={materialStatus} size="small">
                <Column field="ten" header="Nguyên liệu" />
                <Column field="requiredAmount" header="Số lượng cần" />
                <Column field="availableAmount" header="Số lượng có" />
                <Column field="donViTinh" header="Đơn vị" />
                <Column 
                  header="Tình trạng" 
                  body={(rowData) => (
                    <span className={rowData.isAvailable ? "text-green-600" : "text-red-600"}>
                      {rowData.isAvailable ? "Đủ" : "Thiếu"}
                    </span>
                  )}
                />
              </DataTable>
            )}
          </div>
        )}
        
        {error && (
          <div className="col-12 mt-3">
            <Message severity="error" text={error} className="w-full" />
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default SanXuatModal; 