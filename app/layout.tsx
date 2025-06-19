import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ToastProvider';
import { AI } from '@/lib/ai';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agentic Wallet',
  description: 'AI-powered cryptocurrency wallet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AI>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AI>
      </body>
    </html>
  );
}