'use server'

import { getPrisma } from '@/app/utils/prisma'
import { supabase } from '@/lib/supabase'
import { processEpubFileForUser } from './process-epub'
import { notifyEntry } from '@/app/utils/entry-observable'
import { asyncRun } from '../utils/async-run'

interface CreateEntry {
  title: string
  entryType: string
  originalFile: string
}

export async function createEntry({ title, entryType, originalFile }: CreateEntry) {
  const client = await getPrisma()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  
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
    await processEpubFileForUser(userId, entry.id, originalFile, entry.id)
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