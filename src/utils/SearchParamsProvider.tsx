'use client'
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, ReactNode, Suspense } from 'react';

// Context để lưu trữ search params
const SearchParamsContext = createContext<URLSearchParams | null>(null);

// Hook an toàn để sử dụng search params
export const useSearchParamsContext = () => {
  const context = useContext(SearchParamsContext);
  if (!context) {
    throw new Error('useSearchParamsContext must be used within a SearchParamsProvider');
  }
  return context;
};

// Component để cung cấp search params
function SearchParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  );
}

// Wrapper có Suspense tích hợp
export function WithSearchParams({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Đang tải...</div>}>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </Suspense>
  );
}