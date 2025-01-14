import fs from 'fs/promises'
import path from 'path'
import { processEpub } from '@/app/utils/parse-epub';
import { downloadFileStream } from '@/app/utils/download';
import AdmZip from 'adm-zip';
import { uploadBlobToRemote, uploadFolderToRemote } from '@/app/utils/vercel/blob/server';
import { Job, updateJob } from '@/app/utils/job';

export async function processEpubFileForUser(userId: string, entryId: string, epubFileUrl: string, remoteDirPath: string) {

  function updateJobForUser(job: Job) {
    updateJob(userId, job)
  }
  
  updateJobForUser({entryId, stage: 'PRE_PROCESSING'})
  // create temp directories
  const tempDir = path.join(process.cwd(), 'temp');
  const epubPath = path.join(tempDir, 'book.epub');
  const outputPath = path.join(tempDir, 'output');

  await fs.mkdir(tempDir, { recursive: true });

  // Download file using the utility function
  await downloadFileStream(epubFileUrl, epubPath);

  // Unzip epub file to outputPath
  const zip = new AdmZip(epubPath);
  zip.extractAllTo(outputPath, true);

  await uploadFolderToRemote(outputPath, remoteDirPath, 5, (filesUploaded, totalFiles, percent) => {
    console.log('upload progress', filesUploaded, totalFiles, percent)
    updateJobForUser({entryId, stage: 'PRE_PROCESSING', progress: percent})
  });

  updateJobForUser({entryId, stage: 'PROCESSING'})
  // process epub
  const manifest = await processEpub(epubPath, outputPath);
  await uploadBlobToRemote(
    JSON.stringify(manifest),
    remoteDirPath + '/manifest.json'
  )

  updateJobForUser({entryId, stage: 'POST_PROCESSING'})
  // cleanup
  await fs.rm(tempDir, { recursive: true, force: true })

  updateJobForUser({entryId, stage: 'DONE'})
}
