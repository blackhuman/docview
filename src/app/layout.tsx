import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers as NextUIProvider } from "./providers";
import { TRPCProvider } from "@/app/_trpc/Provider";
import SWRProvider from "@/app/_swr/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doc View",
  description: "view various document formats",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} w-screen h-screen`}>
        <TRPCProvider>
          <SWRProvider>
            <NextUIProvider>
              {children}
            </NextUIProvider>
          </SWRProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
