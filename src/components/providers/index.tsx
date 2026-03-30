import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from '@/components/ui/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
