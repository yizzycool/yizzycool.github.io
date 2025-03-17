import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Barcode Detection API: Scan Barcodes & QR Codes with Chrome Web API',
  description:
    "Use Chrome's built-in Barcode Detection API to scan barcodes and QR codes instantly. Fast, accurate, and no extra libraries required. Try it now!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
