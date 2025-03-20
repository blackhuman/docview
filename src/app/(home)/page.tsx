'use client';
import Link from "next/link";
import { 
  useFindManyEntry ,
  useFindFirstUser, 
  useDeleteEntry,
  Provider as ZenStackHooksProvider,
  useCreateEntry,
  useUpdateEntry
} from '@/lib/hooks'
import Login from "./login";
import DraggableUpload from '@/app/components/DraggableUpload';
import React, { useCallback, useEffect, useMemo } from 'react';
import { PutBlobResult } from '@vercel/blob';
import { trpc } from '@/app/_trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import { Job } from '@/app/utils/job';
import { notifyEntryAction, printUser, restartEpubProcessingAction } from '@/app/actions/entry';
import { updateJobAction } from '@/app/actions/job';
import { Button } from '@nextui-org/react';
import { FileType } from '@prisma/client';

export default function Home() {
  const { data: entries, mutate } = useFindManyEntry({orderBy: {createdAt: 'desc'}})
  const { trigger: createEntry } = useCreateEntry()
  const { trigger: updateEntryAction } = useUpdateEntry()
  const { data: user } = useFindFirstUser()
  const queryClient = useQueryClient();
  const { data: jobs = new Map<string, Job>() } = trpc.job.list.useSubscription(undefined, {
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

  trpc.entry.list.useSubscription(undefined, {
    onData(entries) {
      console.log('entries', entries)
      mutate()
    },
    onError(err) {
      console.error('entries error', err)
    },
    onStarted() {
      console.log('entries started')
    }
  })

  useEffect(() => {
    const keys = queryClient.getQueryCache().getAll().map(v => v.queryKey).join(',')
    console.log('keys', keys)
  }, [])

  async function onUploadStart(filename: string) {
    console.log('onUploadStart', filename)
  }

  async function onUploadFinish(filename: string, fileType: FileType, result: PutBlobResult) {
    console.log('onUploadFinish', filename, result)
    const entry = await createEntry({
      data: {
        title: filename, 
        originalFile: result.url,
        entryType: fileType, 
        authorId: user!.id,
        processed: false,
      }
    })
    console.log('entry created', entry)
    mutate()
  }

  const { trigger: deleteEntry } = useDeleteEntry()

  async function handleDelete(id: string) {
    try {
      await deleteEntry({
        where: { id }
      })
      mutate() // Refresh the entries list
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  function updateJob() {
    updateJobAction({
      entryId: '1',
      stage: 'PROCESSING',
      progress: 100
    })
  }

  function updateEntry(entityId: string) {
    updateEntryAction({
      where: {
        id: entityId
      },
      data: {
        processed: true
      }
    })
  }

  async function restartProcessing(entryId: string) {
    await restartEpubProcessingAction(entryId)
  }

  useEffect(() => {
    console.log('entries changed', entries)
  }, [entries])

  return (
    <>
      <header className='w-full'>
        <Login className='absolute top-2 right-2' />
      </header>
      <main className='flex min-h-screen flex-col items-start justify-start p-24'>
        <div className='flex flex-row gap-2'>
          <Button onPress={() => printUser()}>Test</Button>
          <Button onPress={() => updateJob()}>UpdateJob</Button>
          <Button onPress={() => mutate()}>Refresh</Button>
          <Button onPress={() => notifyEntryAction()}>notifyEntryAction</Button>
        </div>
        <DraggableUpload className='w-full min-h-full flex-1'
          onUploadStart={onUploadStart}
          onUploadProgress={progress => console.log('progress', progress)}
          onUploadFinish={onUploadFinish}>
          {entries?.map((entry) => {
            let entryType = 'entry'
            switch (entry.entryType) {
              case 'EPUB':
                entryType = 'epubview2'
                break
              case 'AUDIO':
                entryType = 'audioview'
                break
              case 'HTML':
                entryType = 'htmlview'
                break
            }
            return (
              <div key={entry.id} className='flex flex-row items-start gap-2 group'>
                <Link href={`/${entryType}/${entry.id}`}>{entry.title}</Link>
                {!entry.processed &&
                  <>
                    <span>{jobs.get(entry.id)?.stage ?? 'DONE'}</span>
                    <span>{jobs.get(entry.id)?.progress ?? '0'}</span>
                  </>
                }
                <Button
                  onPress={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 hidden group-hover:block"
                >
                  Delete
                </Button>
                <Button 
                  onPress={() => updateEntry(entry.id)}
                  className="hidden group-hover:block">
                    updateEntry
                </Button>
                <Button 
                  onPress={() => restartProcessing(entry.id)}
                  className="hidden group-hover:block">
                    restartProcessing
                </Button>
              </div>
            )
          })}
        </DraggableUpload>
      </main>
    </>
  );
}
