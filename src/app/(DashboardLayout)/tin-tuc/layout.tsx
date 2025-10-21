import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function TinTucLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

