"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BlogPostAttributes } from '@/data/BlogPost';
import { ProductAttributes } from '@/data/ProductAttributes';

// Enum cho các loại hành động
export enum ActionType {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
  CREATE = 'create'
}

// Interface cho thông tin hành động
interface ActionInfo {
  type: ActionType;
  id?: number;
  slug?: string;
  timestamp: Date;
  entityType?: 'blog' | 'product' | 'category' | null; // Thêm loại thực thể
}

// Interface cho AppContext
interface AppContextProps {
  // Blog State
  blogs: BlogPostAttributes[];
  selectedBlog: BlogPostAttributes | null;
  
  // Product State
  products: ProductAttributes[];
  selectedProduct: ProductAttributes | null;
  
  // Shared State
  loading: boolean;
  error: string | null;
  currentAction: ActionInfo; // Đổi tên thành currentAction
  
  // Blog Actions
  setBlogsData: (data: BlogPostAttributes[]) => void;
  setSelectedBlogData: (blog: BlogPostAttributes | null) => void;
  selectBlog: (blog: BlogPostAttributes | null, actionType?: ActionType) => void;
  clearSelectedBlog: () => void;
  
  // Product Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  createProduct: (product: ProductAttributes) => Promise<void>;
  updateProduct: (id: number, product: ProductAttributes) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  clearSelectedProduct: () => void;
  
  // Shared Actions
  setLoadingState: (isLoading: boolean) => void;
  setErrorState: (error: string | null) => void;
  setCurrentAction: (type: ActionType, entityType?: 'blog' | 'product' | 'category' | null, id?: number, slug?: string) => void; // Cập nhật tham số
}

// API endpoint
const API_URL = '/api/products';

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Blog State
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);

  // Product State
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductAttributes | null>(null);
  
  // Shared State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentActionState] = useState<ActionInfo>({ // Đổi tên
    type: ActionType.NONE,
    entityType: null,
    timestamp: new Date()
  });

  // ====================== BLOG METHODS ======================
  
  // Blog state update methods
  const setBlogsData = useCallback((data: BlogPostAttributes[]) => {
    setBlogs([...data]);
  }, []);

  const setSelectedBlogData = useCallback((blog: BlogPostAttributes | null) => {
    setSelectedBlog(blog);
  }, []);

  // Action method (chung)
  const setCurrentAction = useCallback((
    type: ActionType, 
    entityType: 'blog' | 'product' | 'category' | null = null, 
    id?: number, 
    slug?: string
  ) => {
    setCurrentActionState({
      type,
      entityType,
      id,
      slug,
      timestamp: new Date()
    });
  }, []);

  const selectBlog = useCallback((blog: BlogPostAttributes | null, actionType?: ActionType) => {
    if (blog?.id !== selectedBlog?.id) {
      setSelectedBlog(blog);
      if (blog) {
        setCurrentAction(actionType || ActionType.VIEW, 'blog', blog.id, blog.slug);
      }
    }
  }, [selectedBlog, setCurrentAction]);

  const clearSelectedBlog = useCallback(() => {
    setSelectedBlog(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== PRODUCT METHODS ======================
  
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
      // Cập nhật action khi chọn sản phẩm
      setCurrentAction(ActionType.VIEW, 'product', id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction]);

  // Tạo sản phẩm mới
  const createProduct = useCallback(async (product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'product');
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
  }, [fetchProducts, setCurrentAction]);

  // Cập nhật sản phẩm
  const updateProduct = useCallback(async (id: number, product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);
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
  }, [fetchProducts, setCurrentAction]);

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
      setCurrentAction(ActionType.NONE, null); // Reset action sau khi xóa
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction]);

  // Clear selected product
  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== SHARED METHODS ======================
  
  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  // Cập nhật object value
  const value = {
    // Blog State
    blogs,
    selectedBlog,
    
    // Product State
    products,
    selectedProduct,
    
    // Shared State
    loading,
    error,
    currentAction, // Thay đổi tên
    
    // Blog Actions
    setBlogsData,
    setSelectedBlogData,
    selectBlog,
    clearSelectedBlog,
    
    // Product Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction, // Thay đổi tên
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook để sử dụng app context
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext phải được sử dụng trong AppProvider');
  }
  return context;
};