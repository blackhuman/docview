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

export async function createEntryAction(data: { data: CreateEntry }) {
  const userId = await getUserId()
  if (!userId) return
  const prisma = await getPrisma()
  console.log('createEntryAction', data)
  const entryId = await prisma.entry.create({
    data: {...data.data},
  })
  console.log('createEntryAction after', entryId)
  const entryResult = await prisma.entry.findFirst({where: {id: entryId.id}})
  console.log('createEntryAction after select', entryResult)
  return entryId
}
