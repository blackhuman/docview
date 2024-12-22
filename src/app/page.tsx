'use client';
import Link from "next/link";
import { useFindManyEntry } from '@/lib/hooks/entry'
import Login from "./login";
import { Provider as ZenStackHooksProvider } from '@/lib/hooks';

export default function Home() {
  const { data } = useFindManyEntry()

  return (
    <ZenStackHooksProvider value={{ endpoint: '/api/model'}}>
      <header className='w-full'>
        <Login className='absolute top-2 right-2' />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        {data?.map((entry) => {
          let entryType = 'entry'
          switch (entry.entryType) {
            case 'epub':
              entryType = 'epubview'
              break
          }
          return (
            <div key={entry.id}>
              <Link href={`/${entryType}/${entry.id}`}>{entry.title}</Link>
            </div>
          )
        })}
      </main>
    </ZenStackHooksProvider>
  );
}
