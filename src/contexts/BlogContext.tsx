"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BlogPostAttributes } from '@/data/BlogPost';

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
}

// Cập nhật lại interface
interface BlogContextProps {
  // State
  blogs: BlogPostAttributes[];
  loading: boolean;
  error: string | null;
  selectedBlog: BlogPostAttributes | null;
  actionOn: ActionInfo;
  
  // Actions để cập nhật state
  setBlogsData: (data: BlogPostAttributes[]) => void;
  setLoadingState: (isLoading: boolean) => void;
  setErrorState: (error: string | null) => void;
  setSelectedBlogData: (blog: BlogPostAttributes | null) => void;
  
  // Actions chức năng
  selectBlog: (blog: BlogPostAttributes | null, actionType?: ActionType) => void;
  clearSelectedBlog: () => void;
  setActionOn: (type: ActionType, id?: number, slug?: string) => void;
}

const BlogContext = createContext<BlogContextProps | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionOn, setActionOnState] = useState<ActionInfo>({
    type: ActionType.NONE,
    timestamp: new Date()
  });

  // Các hàm cơ bản để cập nhật state
  const setBlogsData = useCallback((data: BlogPostAttributes[]) => {
    setBlogs([...data]);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const setSelectedBlogData = useCallback((blog: BlogPostAttributes | null) => {
    setSelectedBlog(blog);
  }, []);

  // Hàm cập nhật actionOn
  const setActionOn = useCallback((type: ActionType, id?: number, slug?: string) => {
    setActionOnState({
      type,
      id,
      slug,
      timestamp: new Date()
    });
  }, []);

  // Phương thức kiểm soát để cập nhật state
  const selectBlog = useCallback((blog: BlogPostAttributes | null, actionType?: ActionType) => {
    // Tránh cập nhật không cần thiết
    if (blog?.id !== selectedBlog?.id) {
      setSelectedBlog(blog);
      if (blog) {
        setActionOn(actionType || ActionType.VIEW, blog.id, blog.slug);
      }
    }
  }, [selectedBlog, setActionOn]);

  // Xóa bài viết được chọn
  const clearSelectedBlog = useCallback(() => {
    setSelectedBlog(null);
    setActionOn(ActionType.NONE);
  }, [setActionOn]);

  // Cập nhật object value
  const value = {
    // State
    blogs,
    loading,
    error,
    selectedBlog,
    actionOn,
    
    // Actions để cập nhật state
    setBlogsData,
    setLoadingState,
    setErrorState,
    setSelectedBlogData,
    
    // Actions chức năng
    selectBlog,
    clearSelectedBlog,
    setActionOn
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

// Custom hook để sử dụng blog context
export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlogContext phải được sử dụng trong BlogProvider');
  }
  return context;
};