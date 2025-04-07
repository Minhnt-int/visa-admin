"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProductAttributes } from '@/data/ProductAttributes';

interface ProductContextProps {
  products: ProductAttributes[];
  loading: boolean;
  error: string | null;
  selectedProduct: ProductAttributes | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  createProduct: (product: ProductAttributes) => Promise<void>;
  updateProduct: (id: number, product: ProductAttributes) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  clearSelectedProduct: () => void;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

// API endpoint
const API_URL = '/api/products';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductAttributes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy tất cả sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách sản phẩm');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy sản phẩm theo ID
  const fetchProductById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin sản phẩm');
      }
      const data = await response.json();
      setSelectedProduct(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo sản phẩm mới
  const createProduct = useCallback(async (product: ProductAttributes) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Không thể tạo sản phẩm mới');
      }
      await fetchProducts();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Cập nhật sản phẩm
  const updateProduct = useCallback(async (id: number, product: ProductAttributes) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Không thể cập nhật sản phẩm');
      }
      await fetchProducts();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Xóa sản phẩm
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Không thể xóa sản phẩm');
      }
      await fetchProducts();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Xóa sản phẩm được chọn
  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const value = {
    products,
    loading,
    error,
    selectedProduct,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// Custom hook để sử dụng product context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext phải được sử dụng trong ProductProvider');
  }
  return context;
};