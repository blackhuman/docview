import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers as NextUIProvider } from "./providers";
import { TRPCProvider } from "./_trpc/Provider";
import { Provider as ZenStackHooksProvider } from '@/lib/hooks';
import { FetchFn } from '@zenstackhq/swr/runtime';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doc View",
  description: "view various document formats",
};

const myFetch: FetchFn = (url, options) => {
  options = options ?? {};
  options.headers = {
      ...options.headers,
      'x-my-custom-header': 'hello world',
  };
  return fetch(url, options);
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
          <ZenStackHooksProvider value={{ endpoint: '/api/model', fetch: myFetch }}>
            <NextUIProvider>
              {children}
            </NextUIProvider>
          </ZenStackHooksProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
