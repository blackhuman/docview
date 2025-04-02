import { deleteJob, Job, updateJob } from '@/app/utils/job';
import { getPrisma } from '@/app/utils/prisma';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { uploadBlobToRemote } from '@/app/utils/vercel/blob/server'
import { del } from '@vercel/blob';

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
  // Get content from originalFile
  const response = await fetch(originalFile);
  const htmlContent = await response.text();

  const doc = new JSDOM(htmlContent);
  const reader = new Readability(doc.window.document, {
    serializer: (rootNode: Node) => {
      const rootElement = rootNode as HTMLElement
      const document = rootElement.ownerDocument
      rootElement.querySelectorAll('img').forEach(img => img.remove());
      rootElement.querySelectorAll('hr').forEach(hr => hr.remove());
      rootElement.querySelectorAll('a').forEach(a => {
        const span = document.createElement('span');
        span.innerHTML = a.innerHTML;
        a.parentNode?.replaceChild(span, a);
      });
      return rootElement.innerHTML;
    }
  });
  const article = reader.parse()
  const content = article?.content || ''

  updateJobForUser({entryId, stage: 'PROCESSING'})

  const targetFile = entry.id + '/content'
  await uploadBlobToRemote(content, targetFile)
  await prisma.entry.update({
    where: {
      id: entry.id
    },
    data: {
      originalFile: targetFile,
      processed: true
    }
  })

  del(originalFile)

  updateJobForUser({entryId, stage: 'DONE'})
  deleteJob(userId, entryId)
}
