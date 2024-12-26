'use client';
import Link from "next/link";
import { 
  useCreateEntry, useFindManyEntry ,
  useFindFirstUser, 
  Provider as ZenStackHooksProvider
} from '@/lib/hooks'
import Login from "./login";
import DraggableUpload from './components/DraggableUpload';
import React from 'react';
import { PutBlobResult } from '@vercel/blob';

export default function Home() {
  const { data: entries } = useFindManyEntry()
  const { trigger: createEntry } = useCreateEntry()
  const { data: user } = useFindFirstUser()

  async function onUploadStart(filename: string) {
    console.log('onUploadStart', filename)
  }

  async function onUploadFinish(filename: string, result: PutBlobResult) {
    console.log('onUploadFinish', filename, result)
    await createEntry({ 
      data: { 
        title: filename, 
        entryType: 'epub', 
        author: { connect: { id: user?.id } } 
      }
    })
  }

  return (
    <ZenStackHooksProvider value={{ endpoint: '/api/model'}}>
      <header className='w-full'>
        <Login className='absolute top-2 right-2' />
      </header>
      <main className='flex min-h-screen flex-col items-start justify-start p-24'>
        <DraggableUpload className='w-full min-h-full flex-1'
          onUploadStart={onUploadStart}
          onUploadProgress={progress => console.log('progress', progress)}
          onUploadFinish={onUploadFinish}>
          {entries?.map((entry) => {
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
        </DraggableUpload>
      </main>
    </ZenStackHooksProvider>
  );
}
