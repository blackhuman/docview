'use server'

import { getPrisma } from '@/app/utils/prisma'
import { supabase } from '@/lib/supabase'
import { processEpubFile } from './process-epub'

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

  processEpubFile(entry.id, originalFile, entry.id)
    .then(() => {
      console.log('processEpubFile completed')
      return client.entry.update({
        where: {
          id: entry.id
        },
        data: {
          processed: true
        }
      })
    })
    .then(() => {
      console.log('processed entry updated, entryId:', entry.id)
    })
    .catch((err) => {
      console.error('processEpubFile error, entryId:', entry.id, err)
    })

  return entry
}