'use server'

import { getPrisma } from '@/app/utils/prisma'
import { mockProcessEpubFileForUser, processEpubFileForUser } from './process-epub'
import { notifyEntry } from '@/app/utils/entry-observable'
import { asyncRun } from '../utils/async-run'
import { getUserId } from '../utils/supabase/server'
import { processAudioFileForUser } from './process-audio'
import { copy, del } from '@vercel/blob';
import { getFileBasename } from '../utils/file-util'

interface CreateEntry {
  title: string
  entryType: string
  originalFile: string
  authorId: string
}

export async function printUser() {
  const userId = await getUserId()
  console.log('userId', userId)
}

export async function notifyEntryAction() {
  const userId = await getUserId()
  notifyEntry(userId!)
}

export async function restartEpubProcessingAction(entryId: string) {
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({where: {id: entryId}})
  if (!entry) {
    throw new Error('Entry not found')
  }
  await prisma.entry.update({
    where: {
      id: entry.id
    },
    data: {
      processed: false
    }
  })
  switch (entry.entryType) {
    case 'EPUB':
      await processEpubFileForUser(entry.authorId, entry.id)
      break
    case 'AUDIO':
      await processAudioFileForUser(entry.authorId, entry.id)
      break
    default:
      throw new Error('Entry type not supported')
  }
  const originalFile = entry.originalFile!
  const filename = getFileBasename(originalFile)
  const targetFile = entry.id + '/' + filename
  await copy(originalFile, targetFile, { access: 'public' })
  await prisma.entry.update({
    where: {
      id: entry.id
    },
    data: {
      originalFile: targetFile,
      processed: true
    }
  })
}
