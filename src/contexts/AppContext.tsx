"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BlogPostAttributes } from '@/data/BlogPost';
import { ProductAttributes } from '@/data/ProductAttributes';
import { BlogCategory } from '@/data/blogCategory';
import { ProductCategory } from '@/data/ProductCategory';
import { OrderAttributes } from '@/data/Order';
import { message } from 'antd';
import BlogCategoryService from '@/services/BlogCategoryService';
import ProductCategoryService from '@/services/ProductCategoryService';

// Enum cho các loại hành động
export enum ActionType {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
  CREATE = 'create',
  DELETE = 'delete'
}

// Interface cho thông tin hành động
interface ActionInfo {
  type: ActionType;
  id?: number;
  slug?: string;
  timestamp: Date;
  entityType?: 'blog' | 'blogCategory' | 'product' | 'productCategory' | 'order' | null;
}

// Interface cho AppContext
interface AppContextProps {
  // Blog State
  blogs: BlogPostAttributes[];
  selectedBlog: BlogPostAttributes | null;
  
  // BlogCategory State
  blogCategories: BlogCategory[];
  selectedBlogCategory: BlogCategory | null;
  
  // Product State
  products: ProductAttributes[];
  selectedProduct: ProductAttributes | null;
  
  // ProductCategory State
  productCategories: ProductCategory[];
  selectedProductCategory: ProductCategory | null;
  
  // Order State
  orders: OrderAttributes[];
  selectedOrder: OrderAttributes | null;
  
  // Shared State
  loading: boolean;
  error: string | null;
  currentAction: ActionInfo;
  
  // Blog Actions
  setBlogsData: (data: BlogPostAttributes[]) => void;
  setSelectedBlogData: (blog: BlogPostAttributes | null) => void;
  selectBlog: (blog: BlogPostAttributes | null, actionType?: ActionType) => void;
  clearSelectedBlog: () => void;
  
  // BlogCategory Actions
  fetchBlogCategories: () => Promise<void>;
  fetchBlogCategoryById: (id: number) => Promise<void>;
  createBlogCategory: (category: BlogCategory) => Promise<boolean>;
  updateBlogCategory: (category: BlogCategory) => Promise<boolean>;
  deleteBlogCategory: (id: number) => Promise<boolean>;
  clearSelectedBlogCategory: () => void;
  setSelectedBlogCategory: (category: BlogCategory | null) => void;
  
  // Product Actions
  fetchProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    minPrice?: number;
    maxPrice?: number;
    categoryId?: number;
  }) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  createProduct: (product: ProductAttributes) => Promise<boolean>;
  updateProduct: (id: number, product: ProductAttributes) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  clearSelectedProduct: () => void;
  
  // ProductCategory Actions
  fetchProductCategories: (params?: {
    page?: number;
    limit?: number;
    name?: string;
    parentId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => Promise<void>;
  fetchProductCategoryById: (id: number) => Promise<void>;
  createProductCategory: (category: ProductCategory) => Promise<boolean>;
  updateProductCategory: (id: number, category: ProductCategory) => Promise<boolean>;
  deleteProductCategory: (id: number) => Promise<boolean>;
  clearSelectedProductCategory: () => void;
  
  // Order Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  createOrder: (order: OrderAttributes) => Promise<boolean>;
  updateOrder: (id: number, order: OrderAttributes) => Promise<boolean>;
  deleteOrder: (id: number) => Promise<boolean>;
  clearSelectedOrder: () => void;
  
  // Shared Actions
  setLoadingState: (isLoading: boolean) => void;
  setErrorState: (error: string | null) => void;
  setCurrentAction: (
    type: ActionType, 
    entityType?: 'blog' | 'blogCategory' | 'product' | 'productCategory' | 'order' | null, 
    id?: number, 
    slug?: string
  ) => void;
  
  // Product Status
  productStatus: 'active' | 'deleted';
  toggleProductStatus: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Blog State
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);

  // BlogCategory State
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<BlogCategory | null>(null);

  // Product State
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductAttributes | null>(null);
  
  // ProductCategory State
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null);
  
  // Order State
  const [orders, setOrders] = useState<OrderAttributes[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderAttributes | null>(null);
  
  // Shared State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentActionState] = useState<ActionInfo>({
    type: ActionType.NONE,
    entityType: null,
    timestamp: new Date()
  });

  // Product Status State
  const [productStatus, setProductStatus] = useState<'active' | 'deleted'>('active');

  // ====================== SHARED METHODS ======================
  
  // Action method (chung)
  const setCurrentAction = useCallback((
    type: ActionType, 
    entityType: 'blog' | 'blogCategory' | 'product' | 'productCategory' | 'order' | null = null, 
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

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  // ====================== BLOG METHODS ======================
  
  // Blog state update methods
  const setBlogsData = useCallback((data: BlogPostAttributes[]) => {
    setBlogs([...data]);
  }, []);

  const setSelectedBlogData = useCallback((blog: BlogPostAttributes | null) => {
    setSelectedBlog(blog);
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

  // ====================== BLOG CATEGORY METHODS ======================
  
  // Lấy tất cả danh mục blog
  const fetchBlogCategories = useCallback(async () => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.getAllCategories();
      console.log("API Response:", result); // Debug log
      
      if (result.success) {
        // Đảm bảo result.data là một mảng
        const categories = result.data ? result.data : [];
        console.log("Processed Categories:", categories); // Debug log
        setBlogCategories(categories.categories);
        setError(null);
      } else {
        console.error("API Error:", result.message); // Debug log
        setError(result.message);
        setBlogCategories([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err); // Debug log
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setBlogCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh mục blog theo ID
  const fetchBlogCategoryById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.getCategoryById(id);
      console.log("API Response by ID:", result); // Debug log
      
      if (result.success) {
        setSelectedBlogCategory(result.data);
        setCurrentAction(ActionType.VIEW, 'blogCategory', id);
        setError(null);
      } else {
        console.error("API Error by ID:", result.message); // Debug log
        setError(result.message);
        setSelectedBlogCategory(null);
      }
    } catch (err) {
      console.error("Fetch Error by ID:", err); // Debug log
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction]);

  // Tạo danh mục blog mới
  const createBlogCategory = useCallback(async (category: BlogCategory) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'blogCategory');
      
      const result = await BlogCategoryService.createCategory(category);
      
      if (result.success) {
        await fetchBlogCategories();
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction]);

  // Cập nhật danh mục blog
  const updateBlogCategory = useCallback(async (category: BlogCategory) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'blogCategory');
      
      const result = await BlogCategoryService.updateCategory(category);
      
      if (result.success) {
        await fetchBlogCategories();
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction]);

  // Xóa danh mục blog
  const deleteBlogCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'blogCategory', id);
      
      const result = await BlogCategoryService.deleteCategory(id);
      
      if (result.success) {
        await fetchBlogCategories();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction]);

  // Clear selected blog category
  const clearSelectedBlogCategory = useCallback(() => {
    setSelectedBlogCategory(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== PRODUCT METHODS ======================
  
  // Lấy tất cả sản phẩm
  const fetchProducts = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    minPrice?: number;
    maxPrice?: number;
    categoryId?: number;
  }) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      queryParams.append('status', productStatus);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/get-list?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products);
        setError(null);
      } else {
        setError(result.message);
        setProducts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [productStatus]);

  // Lấy sản phẩm theo ID
  const fetchProductById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result = await response.json();
      
      if (result.success) {
        setSelectedProduct(result.data);
        setCurrentAction(ActionType.VIEW, 'product', id);
        setError(null);
      } else {
        setError(result.message);
        setSelectedProduct(null);
      }
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
      // TODO: Sử dụng ProductService
      await fetchProducts();
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction]);

  // Cập nhật sản phẩm
  const updateProduct = useCallback(async (id: number, product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);
      // TODO: Sử dụng ProductService
      await fetchProducts();
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction]);

  // Xóa sản phẩm
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'product', id);
      
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/product/delete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const result = await response.json();
      
      if (result.success) {
        message.success('Product deleted successfully');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        message.error(result.message || 'Failed to delete product');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction]);

  // Clear selected product
  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== PRODUCT CATEGORY METHODS ======================
  
  // Lấy tất cả danh mục sản phẩm
  const fetchProductCategories = useCallback(async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    parentId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoading(true);
      const result = await ProductCategoryService.getAllCategories(params);
      
      if (result.success) {
        // Đảm bảo result.data là một mảng
        const categories = Array.isArray(result.data) ? result.data : [];
        setProductCategories(categories);
        setError(null);
      } else {
        setError(result.message);
        setProductCategories([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setProductCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh mục sản phẩm theo ID
  const fetchProductCategoryById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await ProductCategoryService.getCategoryById(id);
      
      if (result.success) {
        setSelectedProductCategory(result.data);
        setCurrentAction(ActionType.VIEW, 'productCategory', id);
        setError(null);
      } else {
        setError(result.message);
        setSelectedProductCategory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction]);

  // Tạo danh mục sản phẩm mới
  const createProductCategory = useCallback(async (category: ProductCategory) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'productCategory');
      
      const result = await ProductCategoryService.createCategory(category);
      
      if (result.success) {
        await fetchProductCategories();
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, setCurrentAction]);

  // Cập nhật danh mục sản phẩm
  const updateProductCategory = useCallback(async (id: number, category: ProductCategory) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'productCategory', id);
      
      const result = await ProductCategoryService.updateCategory(id, category);
      
      if (result.success) {
        await fetchProductCategories();
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, setCurrentAction]);

  // Xóa danh mục sản phẩm
  const deleteProductCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'productCategory', id);
      
      const result = await ProductCategoryService.deleteCategory(id);
      
      if (result.success) {
        await fetchProductCategories();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, setCurrentAction]);

  // Clear selected product category
  const clearSelectedProductCategory = useCallback(() => {
    setSelectedProductCategory(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== ORDER METHODS ======================
  
  // Lấy tất cả đơn hàng
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Sử dụng OrderService
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy đơn hàng theo ID
  const fetchOrderById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      // TODO: Sử dụng OrderService
      setCurrentAction(ActionType.VIEW, 'order', id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction]);

  // Tạo đơn hàng mới
  const createOrder = useCallback(async (order: OrderAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'order');
      // TODO: Sử dụng OrderService
      await fetchOrders();
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, setCurrentAction]);

  // Cập nhật đơn hàng
  const updateOrder = useCallback(async (id: number, order: OrderAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'order', id);
      // TODO: Sử dụng OrderService
      await fetchOrders();
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, setCurrentAction]);

  // Xóa đơn hàng
  const deleteOrder = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'order', id);
      // TODO: Sử dụng OrderService
      await fetchOrders();
      setCurrentAction(ActionType.NONE, null);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, setCurrentAction]);

  // Clear selected order
  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // Toggle Product Status
  const toggleProductStatus = useCallback(() => {
    setProductStatus(prev => prev === 'active' ? 'deleted' : 'active');
  }, []);

  // Cập nhật object value
  const value = {
    // Blog State
    blogs,
    selectedBlog,
    
    // BlogCategory State
    blogCategories,
    selectedBlogCategory,
    
    // Product State
    products,
    selectedProduct,
    
    // ProductCategory State
    productCategories,
    selectedProductCategory,
    
    // Order State
    orders,
    selectedOrder,
    
    // Shared State
    loading,
    error,
    currentAction,
    
    // Blog Actions
    setBlogsData,
    setSelectedBlogData,
    selectBlog,
    clearSelectedBlog,
    
    // BlogCategory Actions
    fetchBlogCategories,
    fetchBlogCategoryById,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    clearSelectedBlogCategory,
    setSelectedBlogCategory,
    
    // Product Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
    
    // ProductCategory Actions
    fetchProductCategories,
    fetchProductCategoryById,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    clearSelectedProductCategory,
    
    // Order Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    clearSelectedOrder,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
    
    // Product Status
    productStatus,
    toggleProductStatus,
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