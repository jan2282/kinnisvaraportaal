import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kodu — kinnisvara ilma maaklerita",
    template: "%s — Kodu",
  },
  description:
    "Müü ja osta kinnisvara otse, ilma maaklerita. Säästa kuni 8000 € komisjonitasult. Notar kinnitab iga tehingu.",
  metadataBase: new URL("https://kodu.ee"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="et" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
