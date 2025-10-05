"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BlogPostAttributes } from '@/data/BlogPost';
import VisaServiceAPI from '@/services/VisaService';
import { ProductAttributes } from '@/data/ProductAttributes';
import { BlogCategory } from '@/data/blogCategory';
import { ProductCategory } from '@/data/ProductCategory';
import { OrderAttributes } from '@/data/Order';
import { Snackbar, Alert } from '@/config/mui';
import BlogCategoryService from '@/services/BlogCategoryService';
import ProductCategoryService from '@/services/ProductCategoryService';
import instance from '../../axiosConfig';
import {
  fetchBlogList,
  fetchBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  changeBlogStatus,
  changeBlogCategoryStatus,
  generateAIContent,
  getAISuggestions
} from '@/services/blogService';
import {
  fetchProductList,
  fetchProductBySlug as fetchProductBySlugService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  permanentlyDeleteProduct as permanentlyDeleteProductService,
  activateProduct as activateProductService,
  restoreProduct as restoreProductService,
  changeProductStatus as changeProductStatusService,
  ApiResponse
} from '@/services/productService';
import { useRouter } from 'next/navigation';
import { fetchOrderList, updateOrder, deleteOrder } from '@/services/orderService';
import ApiService from '@/services/ApiService';
import { VisaService, VisaServiceSummary } from '@/data/VisaService';
import { Response } from '@/data/response';

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
  selectedBlogPost: BlogPostAttributes | null;

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
  activateProduct: (productId: number) => Promise<boolean>;
  restoreProduct: (productId: number) => Promise<boolean>;

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
  setSelectedBlogPost: (blog: BlogPostAttributes | null) => void;
  clearSelectedBlogPost: () => void;
  updateBlogPost: (blog: BlogPostAttributes) => Promise<boolean>;
  createBlogPost: (blog: BlogPostAttributes) => Promise<any>; // Hoặc định nghĩa type cụ thể
  changeBlogStatus: (id: number, status: string) => Promise<any>;
  fetchBlogBySlug: (slug: string) => Promise<void>;

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
  changeBlogCategoryStatus: (id: number, status: string) => Promise<any>;


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
  changeProductStatus: (productId: number, status: string) => Promise<boolean>;
  permanentlyDeleteProduct: (id: number) => Promise<boolean>;

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
  changeProductCategoryStatus: (categoryId: number, status: string) => Promise<boolean>; // Thêm dòng này
  clearSelectedProductCategory: () => void;
  setSelectedProductCategory: (category: ProductCategory | null) => void;

  // Order Actions
  fetchOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => Promise<{
    data: OrderAttributes[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };

  }>;
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

  showMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;

  // AI Actions
  generateAIContent: (title: string, mode?: 'blog' | 'product' | 'category' | 'evaluate') => Promise<{ data: string }>;
  getAISuggestions: (content: string) => Promise<{ data: any }>;

  visaServices: VisaServiceSummary[];
  fetchVisaServiceBySlug: (slug: string) => Promise<void>;
  createVisaService: (service: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Response>;
  updateVisaService: (slug: string, service: Partial<VisaService>) => Promise<Response>;
  fetchVisaServices: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string;
      sortOrder?: 'ASC' | 'DESC';
      minPrice?: number;
      maxPrice?: number;
      categoryId?: number;
      status?: 'draft' | 'active' | 'deleted';
    }) => Promise<void>;
    selectedVisaService: VisaService | null;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  // Blog State
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
  const [selectedBlogPost, setSelectedBlogPostState] = useState<BlogPostAttributes | null>(null);

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
  const [visaServices, setVisaServices] = useState<VisaServiceSummary[]>([]);
  const [selectedVisaService, setSelectedVisaService] = useState<VisaService | null>(null);
  // Product Status State
  const [productStatus, setProductStatus] = useState<'draft' | 'active' | 'deleted'>('active');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showMessage = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

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

  const setSelectedBlogPost = useCallback((blog: BlogPostAttributes | null) => {
    setSelectedBlogPostState(blog);
  }, []);

  const clearSelectedBlogPost = useCallback(() => {
    setSelectedBlogPostState(null);
  }, []);

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

      if (result.success) {
        // Đảm bảo result.data là một mảng
        const categories = result.data ? result.data : [];
        setBlogCategories(categories.categories);
        setError(null);
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể tải danh mục bài viết', 'error');
        throw new Error(result.message || 'Không thể tải danh mục bài viết');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Lấy danh mục blog theo ID
  const fetchBlogCategoryBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.getCategoryBySlug(slug);

      if (result.success) {
        setSelectedBlogCategory(result.data);
        setCurrentAction(ActionType.VIEW, 'blogCategory', result.data.id);
        setError(null);
      } else {
        setError(result.message);
        setSelectedBlogCategory(null);
      }
    } catch (err) {
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
        showMessage(result.message || 'Không thể tạo danh mục', 'error');
        throw new Error(result.message || 'Không thể tạo danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err; // Ném lại lỗi
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction, showMessage]);

  // Cập nhật danh mục blog
  const updateBlogCategory = useCallback(async (category: BlogCategory) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'blogCategory');

      const result = await BlogCategoryService.updateCategory(category);

      if (result.success) {
        await fetchBlogCategories();
        showMessage('Đã cập nhật danh mục thành công!', 'success');
        setError(null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể cập nhật danh mục', 'error');
        throw new Error(result.message || 'Không thể cập nhật danh mục'); // ✅ Ném lỗi
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err; // ✅ Ném lại lỗi
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction, showMessage]);

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
        showMessage(result.message || 'Không thể xóa danh mục', 'error');
        throw new Error(result.message || 'Không thể xóa danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error'); // Thêm dòng này
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, setCurrentAction, showMessage]);

  // Thay đổi trạng thái danh mục blog
  const changeBlogCategoryStatus = useCallback(async (id: number, status: string) => {
    try {
      setLoading(true);
      const result = await BlogCategoryService.changeBlogCategoryStatus(id, status);

      if (result.success) {
        showMessage(`Đã cập nhật trạng thái danh mục thành ${status === 'active' ? 'hoạt động' : status === 'draft' ? 'bản nháp' : 'đã xóa'}`, 'success');
        await fetchBlogCategories();
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể cập nhật trạng thái danh mục', 'error');
        throw new Error(result.message || 'Không thể cập nhật trạng thái danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogCategories, showMessage]);

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
        // ⚠️ Cần throw error ở đây để components có thể xử lý
        throw new Error(result.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setProducts([]);
      setProductsPagination({
        total: 0,
        totalPages: 0
      });
      // ⚠️ Cần throw err ở đây
      throw err;
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

      if (response.status >= 200 && response.status < 300) {
        const categories = response.data.data || [];
        setProductCategories(categories);
        setError(null);
      } else {
        setError(response.data.message);
        setProductCategories([]);
      }
    } catch (err) {
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
        const errorMsg = response.data ? response.data.message : 'Không thể tải thông tin sản phẩm';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction, showMessage]);

  // Tạo sản phẩm mới
  const createProduct = useCallback(async (product: ProductAttributes) => {
    try {
      setLoading(true);
      const result = await createProductService(product);

      if (result.success) {
        await fetchProducts();
        setError(null);
        return result.data;
      } else {
        // Thay vì throw Error, hãy trả về kết quả lỗi

        setError(result.message);
        throw {
          response: {
            data: {
              message: result.message,
              data: result.data || null,
              success: false
            }
          },
        };
      }
    } catch (err: any) {
      // Block catch này chỉ bắt lỗi từ network/server, không phải lỗi tự throw
      setError(err?.response?.data?.message || err?.message || 'Lỗi không xác định');
      throw {
        success: false,
        message: err?.response?.data?.message || err?.message,
        data: err?.response?.data?.data || null
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật sản phẩm
  const updateProduct = useCallback(async (id: number, product: ProductAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'product', id);

      const result = await updateProductService(product) as ApiResponse;

      if (result.success) {
        await fetchProducts();
        showMessage('Đã cập nhật sản phẩm thành công!', 'success'); // Thêm thông báo thành công
        setError(null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể cập nhật sản phẩm', 'error');
        throw new Error(result.message || 'Không thể cập nhật sản phẩm'); // Thay vì return false
      }
    } catch (err: any) {
      // Xử lý lỗi API giống createProduct
      if (err?.response?.data?.error?.data && Array.isArray(err.response.data.error.data)) {
        const errorMessages = err.response.data.error.data.join(', ');
        setError(errorMessages);
        showMessage(errorMessages, 'error');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        setError(errorMessage);
        showMessage(errorMessage, 'error');
      }

      throw err; // Luôn ném lại lỗi thay vì return false
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction, showMessage]);

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
      const result = await activateProductService(id);

      if (result.success) {
        showMessage('Product activated successfully', 'success');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Failed to activate product', 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction, showMessage]);

  const restoreProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await restoreProductService(id);

      if (result.success) {
        showMessage('Product restored successfully', 'success');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Failed to restore product', 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction, showMessage]);

  const permanentlyDeleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await permanentlyDeleteProductService(id);

      if (result.success) {
        showMessage('Product permanently deleted successfully', 'success');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Failed to permanently delete product', 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction, showMessage]);

  const changeProductStatus = useCallback(async (productId: number, status: string) => {
    try {
      setLoading(true);
      const result = await changeProductStatusService(productId, status);

      if (result.success) {
        showMessage(`Product status changed to ${status} successfully`, 'success');
        await fetchProducts();
        setCurrentAction(ActionType.NONE, null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Failed to change product status', 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setCurrentAction, showMessage]);

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
        showMessage('Đã tạo danh mục mới thành công!', 'success');
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể tạo danh mục', 'error');
        throw new Error(result.message); // ✅ Ném lỗi để component bắt được
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      throw err; // ✅ Ném lỗi để component bắt được
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
        showMessage('Đã cập nhật danh mục thành công!', 'success');
        setError(null);
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể cập nhật danh mục', 'error');
        throw new Error(result.message || 'Không thể cập nhật danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, setCurrentAction, showMessage]);

  // Xóa danh mục sản phẩm
  const deleteProductCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'productCategory');

      const result = await ProductCategoryService.deleteCategory(id);

      if (result.success) {
        await fetchProductCategories();
        showMessage('Đã xóa danh mục thành công', 'success');
        return true;
      } else {
        showMessage(result.message || 'Không thể xóa danh mục', 'error');
        throw new Error(result.message || 'Không thể xóa danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa danh mục';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err; // Đảm bảo lỗi được truyền ra ngoài
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, setCurrentAction, showMessage]);

  // Clear selected product category
  const clearSelectedProductCategory = useCallback(() => {
    setSelectedProductCategory(null);
    setCurrentAction(ActionType.NONE, null);
  }, [setCurrentAction]);

  const changeProductCategoryStatus = useCallback(async (categoryId: number, status: string) => {
    try {
      setLoading(true);
      const result = await ProductCategoryService.changeProductCategoryStatus(categoryId, status);

      if (result.success) {
        showMessage(`Đã cập nhật trạng thái danh mục thành ${status === 'active' ? 'hoạt động' : 'đã xóa'}`, 'success');
        await fetchProductCategories();
        return true;
      } else {
        setError(result.message);
        showMessage(result.message || 'Không thể cập nhật trạng thái danh mục', 'error');
        throw new Error(result.message || 'Không thể cập nhật trạng thái danh mục');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProductCategories, showMessage]);

  // ====================== ORDER METHODS ======================

  // Lấy tất cả đơn hàng
  const fetchOrders = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOrderList(params) as {
        data: OrderAttributes[],
        pagination: { total: number; page: number; limit: number; totalPages: number }
      };

      if (result && result.data) {
        setOrders(result.data);
        return result;
      } else {
        const errorMsg = 'Không thể tải danh sách đơn hàng';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

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
  const updateOrderHandle = useCallback(async (id: number, order: OrderAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'order', id);
      const result = await updateOrder({ ...order, id }) as any;

      if (result && result.success) {
        await fetchOrders();
        showMessage('Đã cập nhật đơn hàng thành công!', 'success');
        setError(null);
        return true;
      } else {
        const errorMsg = result?.message || 'Không thể cập nhật đơn hàng';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, setCurrentAction, showMessage]);

  // Xóa đơn hàng
  const deleteOrderHandle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.DELETE, 'order', id);
      const result = await deleteOrder(id) as any;

      if (result && result.success) {
        await fetchOrders();
        showMessage('Đã xóa đơn hàng thành công!', 'success');
        setCurrentAction(ActionType.NONE, null);
        setError(null);
        return true;
      } else {
        const errorMsg = result?.message || 'Không thể xóa đơn hàng';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, setCurrentAction, showMessage]);

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

  // Blog Actions
  const updateBlogPost = useCallback(async (blog: BlogPostAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.EDIT, 'blog');

      const result = await updateBlog(blog) as { data: BlogPostAttributes; message: string };
      
      if (result && result.message) {
        await fetchBlogList();
        showMessage('Đã cập nhật bài viết thành công!', 'success');
        setError(null);
        return true;
      } else {
        const errorMsg = 'Đã xảy ra lỗi khi cập nhật bài viết';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogList, setCurrentAction, showMessage]);

  // Blog Actions
  const createBlogPost = useCallback(async (blog: BlogPostAttributes) => {
    try {
      setLoading(true);
      setCurrentAction(ActionType.CREATE, 'blog');
      const result = await createBlog(blog) as any;
      
      // Kiểm tra dựa trên status code hoặc message thành công
      if (result && 
          ((result.status && result.status >= 200 && result.status < 300) || 
           (result.data && result.data.message === "Blog post created successfully!"))) {
        
        await fetchBlogList();
        setError(null);
        return result;
      } else {
        setError(result.message ?? 'Đã xảy ra lỗi');
        throw result;
      }
    } catch (err: any) {
      // Xử lý lỗi...
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBlogList, setCurrentAction]);

  // AI Actions
  const handleGenerateAIContent = useCallback(async (title: string, mode: 'product' | 'blog' | 'category' | 'evaluate' = 'blog'): Promise<{ data: string }> => {
    try {
      setLoading(true);

      // Gọi hàm generateAIContent đã được cập nhật với 3 mode
      const result = await generateAIContent(title, mode) as any;

      if (!result || !result.data) {
        throw new Error('Không nhận được kết quả từ AI');
      }

      return { data: result.data };
    } catch (err) {
      console.error('Error generating AI content:', err);

      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(err);
      setError(errorResult.message);
      showMessage(errorResult.message, 'error');

      throw err;
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  const handleGetAISuggestions = useCallback(async (content: string): Promise<{ data: any }> => {
    try {
      setLoading(true);
      const result = await getAISuggestions(content) as { data: any };
      return { data: result.data };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add the implementation
  const handleFetchBlogBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetchBlogBySlug(slug) as unknown as {
        data: {
          id: number;
          title: string;
          content: string;
          slug: string;
          metaTitle: string;
          metaDescription: string;
          metaKeywords: string;
          author: string;
          publishedAt: string;
          viewCount: number;
          blogCategoryId: number;
          avatarUrl: string;
          status: string;
          createdAt: string;
          updatedAt: string;
          category: {
            id: number;
            name: string;
            slug: string;
          };
        };
      };
      if (response.data) {
        const blogData = {
          ...response.data,
          publishedAt: new Date(response.data.publishedAt),
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        };
        setSelectedBlog(blogData as unknown as BlogPostAttributes);
        setCurrentAction(ActionType.VIEW, 'blog', response.data.id);
        setError(null);
      } else {
        const errorMsg = 'Không thể tải thông tin bài viết';
        setError(errorMsg);
        showMessage(errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentAction, showMessage]);

      // --- Visa Service Functions ---
      const fetchVisaServices = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        tags?: string;
        sortOrder?: 'ASC' | 'DESC';
        minPrice?: number;
        maxPrice?: number;
        categoryId?: number;
        status?: 'draft' | 'active' | 'deleted';
      }) => {
        const result = await VisaServiceAPI.getAll();
        setVisaServices(result.data);
    }, []);

    const fetchVisaServiceBySlug = useCallback(async (slug: string) => {
        const service = await VisaServiceAPI.getBySlug(slug);
        setSelectedVisaService(service);
    }, []);

    const createVisaService = useCallback(async (service: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'>): Promise<Response> => {
        try {
            const createdService = await VisaServiceAPI.create(service); // Giả định VisaServiceAPI.create trả về VisaService khi thành công
            await fetchVisaServices();
            return { success: true, data: createdService }; // Trả về data khi thành công
        } catch (error: any) { // Nên bắt lỗi cụ thể hơn nếu có thể
            console.error("Error creating visa service in context:", error);
            return { success: false, error: [error instanceof Error ? error : new Error(error.message || "Unknown error")] }; // Trả về error khi có lỗi
        }
    }, [fetchVisaServices]);
    

    const updateVisaService = useCallback(async (slug: string, service: Partial<VisaService>): Promise<Response> => {
        try {
            const updatedService = await VisaServiceAPI.update(slug, service); // Giả định VisaServiceAPI.update trả về VisaService khi thành công và boolean khi không tìm thấy/lỗi (cần kiểm tra lại API)
            if (updatedService) { // Kiểm tra xem cập nhật có thành công và trả về dữ liệu không
                 await fetchVisaServices();
                 return { success: true, data: updatedService }; // Trả về data khi thành công
            } else {
                 // Xử lý trường hợp API.update trả về false hoặc null khi không thành công nhưng không throw error
                 return { success: false, error: [new Error("Update failed or service not found")] };
            }
        } catch (error: any) { // Nên bắt lỗi cụ thể hơn nếu có thể
            console.error("Error updating visa service in context:", error);
            return { success: false, error: [error instanceof Error ? error : new Error(error.message || "Unknown error")] }; // Trả về error khi có lỗi
        }
    }, [fetchVisaServices]);
    
    

  // Cập nhật object value
  const value = {
    fetchVisaServiceBySlug,
    createVisaService,
    updateVisaService,
    fetchVisaServices,
    // Blog State
    blogs,
    selectedBlog,
    selectedBlogPost,

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
    setSelectedBlogPost,
    clearSelectedBlogPost,
    updateBlogPost,
    createBlogPost,
    changeBlogStatus,
    fetchBlogBySlug: handleFetchBlogBySlug,

    // BlogCategory Actions
    fetchBlogCategories,
    fetchBlogCategoryBySlug,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    clearSelectedBlogCategory,
    setSelectedBlogCategory,
    changeBlogCategoryStatus,

    // Product Actions
    fetchProducts,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    changeProductStatus,
    clearSelectedProduct,
    permanentlyDeleteProduct,
    activateProduct,
    restoreProduct,

    // ProductCategory Actions
    fetchProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    changeProductCategoryStatus, // Thêm dòng này
    clearSelectedProductCategory,
    setSelectedProductCategory,
    // Order Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder: updateOrderHandle,
    deleteOrder: deleteOrderHandle,
    clearSelectedOrder,

    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,

    // Product Status
    productStatus,
    toggleProductStatus,

    showMessage,

    // AI Actions
    generateAIContent: handleGenerateAIContent,
    getAISuggestions: handleGetAISuggestions,

    selectedVisaService,
    visaServices
  };

  return <AppContext.Provider value={value}>
    {children}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </AppContext.Provider>;
};

// Custom hook để sử dụng app context
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext phải được sử dụng trong AppProvider');
  }
  return context;
};