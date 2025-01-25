import { Entry, PrismaClient } from '@prisma/client';
import { getPrisma } from '.';
import { globalEntryBus } from '../singleton';
import { mockProcessEpubFileForUser, processEpubFileForUser } from '@/app/actions/process-epub';

export async function onEntryCreated(prisma: PrismaClient, entry: Entry) {
  console.log('onEntryCreated', entry)
  globalEntryBus.push({
    changeType: 'create',
    db: 'entry',
    data: entry,
  })
  console.log('processEpubFileForUser', entry)
  await processEpubFileForUser(entry.authorId, entry.id)
  console.log('processEpubFileForUser end', entry)
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