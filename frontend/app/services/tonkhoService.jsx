import axios from "axios";
import { TonKho } from "../modal/TonKhoModal";

const API_URL = `${process.env.URL_REACT || "https://quanly-sanxuat-tts-vnpt.onrender.com"}/api/tonkho`;

export const TonKhoService = {
  async getAll() {
    const response = await axios.get(API_URL);
    return response.data;
  },
  async getById(id) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  async create(data) {
    await axios.post(API_URL, data);
  },
  async update(id, data) {
    await axios.put(`${API_URL}/${id}`, data);
  },
  async delete(id) {
    await axios.delete(`${API_URL}/${id}`);
  },
};

console.log("TonKho API_URL:", API_URL);
