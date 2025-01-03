import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers as NextUIProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doc View",
  description: "view various document formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} w-screen h-screen`}>
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </body>
    </html>
  );
}
