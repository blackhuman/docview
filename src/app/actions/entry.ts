'use server'

import { getPrisma } from '@/app/utils/prisma'
import { mockProcessEpubFileForUser, processEpubFileForUser } from './process-epub'
import { notifyEntry } from '@/app/utils/entry-observable'
import { asyncRun } from '../utils/async-run'
import { getUserId } from '../utils/supabase/server'

interface CreateEntry {
  title: string
  entryType: string
  originalFile: string
}

export async function printUser() {
  const userId = await getUserId()
  console.log('userId', userId)
}

export async function notifyEntryAction() {
  const userId = await getUserId()
  notifyEntry(userId!)
}

export async function createEntry({ title, entryType, originalFile }: CreateEntry) {
  const client = await getPrisma()
  const userId = await getUserId()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const entry = await client.entry.create({
    data: {
      title,
      entryType,
      originalFile,
      authorId: userId
    }
  })

  asyncRun(async () => {
    await mockProcessEpubFileForUser(userId, entry.id, originalFile, entry.id)
    console.log('processEpubFile completed')
    await client.entry.update({
      where: {
        id: entry.id
      },
      data: {
        processed: true
      }
    })
    notifyEntry(userId)
  })

  return entry
}

export async function updateEntry(id: string, processed: boolean) {
  const client = await getPrisma()
  return await client.entry.update({
    where: {
      id
    },
    data: {
      processed
    }
  })
}