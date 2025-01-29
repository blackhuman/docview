import { Entry, PrismaClient } from '@prisma/client';
import { getPrisma } from '.';
import { globalEntryBus } from '../singleton';
import { mockProcessEpubFileForUser, processEpubFileForUser } from '@/app/actions/process-epub';
import { restartEpubProcessingAction } from '@/app/actions/entry';

export async function onEntryCreated(prisma: PrismaClient, entry: Entry) {
  console.log('onEntryCreated', entry)
  globalEntryBus.push({
    changeType: 'create',
    db: 'entry',
    data: entry,
  })
  console.log('processEpubFileForUser', entry)
  await restartEpubProcessingAction(entry.id)
}

export async function onEntryUpdated(prisma: PrismaClient, entry: Entry) {
  globalEntryBus.push({
    changeType: 'update',
    db: 'entry',
    data: entry
  })
}