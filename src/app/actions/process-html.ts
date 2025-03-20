import { deleteJob, Job, updateJob } from '@/app/utils/job';
import { getPrisma } from '@/app/utils/prisma';

export async function processHtmlFileForUser(userId: string, entryId: string) {
  console.log('processHtmlFileForUser entry:', entryId)
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({where: {id: entryId, authorId: userId}})
  if (!entry || entry.entryType !== 'HTML') {
    throw new Error('Entry not found')
  }

  const { originalFile, id: remoteDirPath, processed } = entry
  if (!originalFile) {
    throw new Error('Html file not found')
  }
  if (processed) {
    throw new Error('Html file already processed')
  }

  function updateJobForUser(job: Job) {
    updateJob(userId, job)
  }

  updateJobForUser({entryId, stage: 'PRE_PROCESSING'})
  updateJobForUser({entryId, stage: 'DONE'})
  deleteJob(userId, entryId)

}
