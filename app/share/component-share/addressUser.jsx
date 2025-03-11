import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_URL_SERVER;

const InventorySelector = ({ selectedMaterial, selectedProduct, selectedStock, setSelectedMaterial, setSelectedProduct, setSelectedStock }) => {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const response = await axios.get(`${API_URL}/materials`);
        setMaterials(response.data.data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const response = await axios.get(`${API_URL}/products/${selectedMaterial.id}`);
          setProducts(response.data.data || []);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [selectedMaterial]);

  useEffect(() => {
    if (selectedProduct) {
      const fetchStocks = async () => {
        setLoadingStocks(true);
        try {
          const response = await axios.get(`${API_URL}/stocks/${selectedProduct.id}`);
          setStocks(response.data.data || []);
        } catch (error) {
          console.error('Error fetching stocks:', error);
        } finally {
          setLoadingStocks(false);
        }
      };
      fetchStocks();
    } else {
      setStocks([]);
    }
  }, [selectedProduct]);

  return (
    <div className="p-fluid">
      <div className="field">
        <label>Chọn nguyên liệu</label>
        {loadingMaterials && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
        <Dropdown
          value={selectedMaterial}
          options={materials}
          onChange={(e) => {
            setSelectedMaterial(e.value);
            setSelectedProduct(null);
            setSelectedStock(null);
          }}
          optionLabel="name"
          placeholder="Chọn nguyên liệu"
          disabled={loadingMaterials}
          filter
          filterPlaceholder="Tìm kiếm nguyên liệu"
        />
      </div>

      <div className="field">
        <label>Chọn thành phẩm</label>
        {loadingProducts && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
        <Dropdown
          value={selectedProduct}
          options={products}
          onChange={(e) => {
            setSelectedProduct(e.value);
            setSelectedStock(null);
          }}
          optionLabel="name"
          placeholder="Chọn thành phẩm"
          disabled={!selectedMaterial || loadingProducts}
          filter
          filterPlaceholder="Tìm kiếm thành phẩm"
        />
      </div>

      <div className="field">
        <label>Chọn trạng thái tồn kho (Nhập/Xuất)</label>
        {loadingStocks && <ProgressSpinner style={{ width: '20px', height: '20px' }} />}
        <Dropdown
          value={selectedStock}
          options={stocks}
          onChange={(e) => setSelectedStock(e.value)}
          optionLabel="status"
          placeholder="Chọn trạng thái tồn kho"
          disabled={!selectedProduct || loadingStocks}
          filter
          filterPlaceholder="Tìm kiếm tồn kho"
        />
      </div>
    </div>
  );
};

export default InventorySelector;
