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
import instance from '../../axiosConfig';
import { fetchBlogList, fetchBlogBySlug, createBlog, updateBlog, deleteBlog } from '@/services/blogService';
import { 
  fetchProductList, 
  fetchProductBySlug as fetchProductBySlugService, 
  createProduct as createProductService, 
  updateProduct as updateProductService, 
  deleteProduct as deleteProductService,
  permanentlyDeleteProduct as permanentlyDeleteProductService,
  activateProduct as activateProductService,
  restoreProduct as restoreProductService,
  ApiResponse
} from '@/services/productService';

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
  productsPagination: {
    total: number;
    totalPages: number;
  };
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
  fetchBlogCategories: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => Promise<void>;
  fetchBlogCategoryBySlug: (slug: string) => Promise<void>;
  createBlogCategory: (category: BlogCategory) => Promise<boolean>;
  updateBlogCategory: (category: BlogCategory) => Promise<boolean>;
  deleteBlogCategory: (id: number) => Promise<boolean>;
  clearSelectedBlogCategory: () => void;
  setSelectedBlogCategory: (category: BlogCategory | null) => void;
  permanentlyDeleteProduct: (id: number) => Promise<boolean>;
  activateProduct: (id: number) => Promise<boolean>;
  restoreProduct: (id: number) => Promise<boolean>;
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
    status?: 'draft' | 'active' | 'deleted';
  }) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
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
    status?: string;
    search?: string;
  }) => Promise<void>;
  createProductCategory: (category: ProductCategory) => Promise<boolean>;
  updateProductCategory: (id: number, category: ProductCategory) => Promise<boolean>;
  deleteProductCategory: (id: number) => Promise<boolean>;
  clearSelectedProductCategory: () => void;
  setSelectedProductCategory: (category: ProductCategory | null) => void;
  
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
  productStatus: 'draft' | 'active' | 'deleted';
  toggleProductStatus: (status: 'draft' | 'active' | 'deleted') => void;
  setSelectedProduct: (product: ProductAttributes | null) => void;
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
  const [productsPagination, setProductsPagination] = useState({
    total: 0,
    totalPages: 0
  });
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
  const [productStatus, setProductStatus] = useState<'draft' | 'active' | 'deleted'>('active');

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
    setSelectedBlog(blog);
    if (blog) {
      setCurrentAction(actionType || ActionType.VIEW, 'blog', blog.id, blog.slug);
    }
  }, [selectedBlog, setCurrentAction]);

  const clearSelectedBlog = useCallback(() => {
    setSelectedBlog(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  // ====================== BLOG CATEGORY METHODS ======================
  
  // Lấy tất cả danh mục blog
  const fetchBlogCategories = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.getAllCategories(params);
      console.log("Blog Categories API Response:", result); // Debug log
      
      if (result.success) {
        // Đảm bảo result.data là một mảng
        const categories = result.data ? result.data : [];
        console.log("Processed Blog Categories:", categories); // Debug log
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
  const fetchBlogCategoryBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.getCategoryBySlug(slug);
      console.log("API Response by ID:", result); // Debug log
      
      if (result.success) {
        setSelectedBlogCategory(result.data);
        setCurrentAction(ActionType.VIEW, 'blogCategory', result.data.id);
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
    status?: 'draft' | 'active' | 'deleted';
  }) => {
    try {
      setLoading(true);
      const result = await fetchProductList(params || {});
      
      if (result.success && result.data) {
        setProducts(result.data);
        setProductsPagination(result.pagination || { total: 0, totalPages: 0 });
        setError(null);
      } else {
        setError(result.message);
        setProducts([]);
        setProductsPagination({
          total: 0,
          totalPages: 0
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setProducts([]);
      setProductsPagination({
        total: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch product categories
  const fetchProductCategories = useCallback(async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    parentId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const response = await instance.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category/get-list`, { params });
      console.log("Product Categories API Response:", response);
      
      if (response.status >= 200 && response.status < 300) {
        const categories = response.data.data || [];
        console.log("Processed Product Categories:", categories);
        setProductCategories(categories);
        setError(null);
      } else {
        console.error("API Error:", response.data.message);
        setError(response.data.message);
        setProductCategories([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setProductCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy sản phẩm theo slug
  const fetchProductBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetchProductBySlugService(slug) as any;
      
      if (response && response.data && response.data.success) {
        setSelectedProduct(response.data.data);
        setCurrentAction(ActionType.VIEW, 'product', response.data.data.id);
        setError(null);
      } else {
        setError(response.data ? response.data.message : 'Failed to fetch product');
        setSelectedProduct(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setSelectedProduct(null);
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction]);

  // Tạo sản phẩm mới
  const createProduct = useCallback(async (product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'product');
      const result = await createProductService(product) as ApiResponse;
      if (result.success) {
        await fetchProducts();
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
  }, [fetchProducts, setCurrentAction]);

  // Cập nhật sản phẩm
  const updateProduct = useCallback(async (id: number, product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);
      const result = await updateProductService(product) as ApiResponse;
      if (result.success) {
        await fetchProducts();
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
  }, [fetchProducts, setCurrentAction]);

  // Xóa sản phẩm
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'product', id);
      // Note: This is a soft delete using the existing deleteProduct API
      const result = await deleteProductService(id) as ApiResponse;
      if (result.success) {
        await fetchProducts();
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
  }, [fetchProducts, setCurrentAction]);

  const activateProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);
      
      const result = await activateProductService(id) as ApiResponse;
      
      if (result.success) {
        message.success('Product activated successfully');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        message.error(result.message || 'Failed to activate product');
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

  const restoreProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);
      
      const result = await restoreProductService(id) as ApiResponse;
      
      if (result.success) {
        message.success('Product restored successfully');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        message.error(result.message || 'Failed to restore product');
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

  const permanentlyDeleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'product', id);
      
      const result = await permanentlyDeleteProductService(id) as ApiResponse;
      
      if (result.success) {
        message.success('Product permanently deleted successfully');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        setError(result.message);
        message.error(result.message || 'Failed to permanently delete product');
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
  
  // Lấy danh mục sản phẩm theo ID

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
  const toggleProductStatus = useCallback((status: 'draft' | 'active' | 'deleted') => {
    setProductStatus(status);
    fetchProducts({ status });
  }, [fetchProducts]);

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
    productsPagination,
    selectedProduct,
    setSelectedProduct,
    
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
    fetchBlogCategoryBySlug,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    clearSelectedBlogCategory,
    setSelectedBlogCategory,
    
    // Product Actions
    fetchProducts,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
    permanentlyDeleteProduct,
    activateProduct,
    restoreProduct,

    // ProductCategory Actions
    fetchProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    clearSelectedProductCategory,
    setSelectedProductCategory,
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