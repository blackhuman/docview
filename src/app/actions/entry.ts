'use server'

import { getPrisma } from '@/app/utils/prisma'

interface CreateEntry {
  title: string, 
  entryType: string
}

export async function createEntry({ title, entryType }: CreateEntry) {
  const client = await getPrisma()
  const entry = await client.entry.create({
    data: {
      title,
      entryType
    }
  })
}