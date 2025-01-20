import { Entry, PrismaClient } from '@prisma/client';
import { getPrisma } from '.';
import { globalEntryBus } from '../singleton';
import { mockProcessEpubFileForUser } from '@/app/actions/process-epub';
import type { Prisma } from '@zenstackhq/runtime/models'

export async function onEntryCreated(prisma: Prisma.DefaultPrismaClient, entry: Entry) {
  console.log('onEntryCreated', entry)
  globalEntryBus.push({
    changeType: 'create',
    db: 'entry',
    data: entry,
  })
  console.log('mockProcessEpubFileForUser', entry)
  await mockProcessEpubFileForUser(entry.authorId, entry.id)
  console.log('mockProcessEpubFileForUser end', entry)
  await prisma.entry.update({
    where: {
      id: entry.id
    },
    data: {
      processed: true
    }
  })
}

export async function onEntryUpdated(prisma: PrismaClient, entry: Entry) {
  globalEntryBus.push({
    changeType: 'update',
    db: 'entry',
    data: entry
  })
}