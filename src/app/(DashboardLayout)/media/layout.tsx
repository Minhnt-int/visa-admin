import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function MediaLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

