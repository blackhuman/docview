'use client';
import Link from "next/link";
import { 
  useFindManyEntry ,
  useFindFirstUser, 
  Provider as ZenStackHooksProvider
} from '@/lib/hooks'
import Login from "./login";
import DraggableUpload from './components/DraggableUpload';
import React, { useCallback, useEffect, useMemo } from 'react';
import { PutBlobResult } from '@vercel/blob';
import { trpc } from '@/app/_trpc/client';
import { TRPCClientError } from '@trpc/client';

export default function Home() {
  const { data: entries } = useFindManyEntry()
  // const { data: user } = useFindFirstUser()
  const jobsSubscription = trpc.job.list.useSubscription(undefined, {
    onData(jobs) {
      console.log('jobs', jobs)
    },
    onError(err) {
      console.error('jobs error', err)
    },
    onStarted() {
      console.log('jobs started')
    }
  })

  // useEffect(() => {
  //   if (jobsSubscription.error instanceof TRPCClientError) {
  //     const error = jobsSubscription.error as TRPCClientError<any>
  //     console.log('jobsSubscription error', error.cause)
  //   }
  // }, [jobsSubscription.error])

  // useEffect(() => {
  //   console.log('jobsSubscription data', jobsSubscription.data)
  // }, [jobsSubscription.data])

  // useEffect(() => {
  //   const evtSource = new EventSource("/api/sse");
  //   evtSource.addEventListener('message', (event) => {
  //     console.log('event', event)
  //     evtSource.close()
  //   })
  //   evtSource.addEventListener('error', (event) => {
  //     console.log('event', event)
  //     evtSource.close()
  //   })
  // }, [])

  async function onUploadStart(filename: string) {
    console.log('onUploadStart', filename)
  }

  async function onUploadFinish(filename: string, result: PutBlobResult) {
    console.log('onUploadFinish', filename, result)
    // await createEntry({
    //   title: filename, 
    //   originalFile: result.url,
    //   entryType: 'epub', 
    // })
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
