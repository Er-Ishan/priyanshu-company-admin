'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </SessionProvider>
    </ThemeProvider>
  );
}
