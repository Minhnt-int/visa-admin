import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function TourDuLichLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

