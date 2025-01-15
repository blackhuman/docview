'use client';

import { Provider as ZenStackHooksProvider } from '@/lib/hooks';
import { FetchFn } from '@zenstackhq/swr/runtime';

const myFetch: FetchFn = (url, options) => {
  options = options ?? {};
  options.headers = {
      ...options.headers,
      'x-my-custom-header': 'hello world',
  };
  return fetch(url, options);
};

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ZenStackHooksProvider value={{ endpoint: '/api/model', fetch: myFetch }}>
      {children}
    </ZenStackHooksProvider>
  )
}