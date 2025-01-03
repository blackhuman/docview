import { put, PutBlobResult } from '@vercel/blob';
import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { TaskRunner } from '@/app/utils/task-runner';

/**
 * Upload a file to Vercel Blob from the server side
 * @param localFilePath Absolute path to the file
 * @returns Upload result containing URL and metadata
 */
export async function uploadFileToRemote(localFilePath: string, remoteFilePath: string): Promise<PutBlobResult> {
  // Verify file exists and get its stats
  const stats = await stat(localFilePath);
  if (!stats.isFile()) {
    throw new Error(`Not a file: ${localFilePath}`);
  }

  // Read file content
  const fileContent = await readFile(localFilePath);

  console.log('uploadToBlob', remoteFilePath);
  // Upload to Vercel Blob
  const blob = await put(remoteFilePath, fileContent, {
    access: 'public',
    addRandomSuffix: false,
  });

  return blob;
}

export async function uploadBlobToRemote(content: Buffer | string, remoteBlobPath: string): Promise<PutBlobResult> {
  return await put(remoteBlobPath, content, {
    access: 'public',
    addRandomSuffix: false,
  });
}

/**
 * Upload all files in a directory to Vercel Blob with parallel processing
 * @param localDirPath Directory path to upload
 * @param remoteDirPath Remote directory path in blob storage
 * @param concurrency Maximum number of concurrent uploads (default: 4)
 * @param onProgress Optional callback for upload progress (filesUploaded, totalFiles, percent)
 * @returns Array of upload results
 */
export async function uploadFolderToRemote(
  localDirPath: string,
  remoteDirPath: string,
  concurrency = 4,
  onProgress?: (filesUploaded: number, totalFiles: number, percent: number) => void
): Promise<PutBlobResult[]> {
  const results: PutBlobResult[] = [];
  
  // Verify directory exists
  const stats = await stat(localDirPath);
  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${localDirPath}`);
  }

  // Collect all file paths and count them
  async function collectFiles(dirPath: string): Promise<{ 
    files: { localPath: string; blobPath: string }[];
    count: number;
  }> {
    const files: { localPath: string; blobPath: string }[] = [];
    let count = 0;
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryStats = await stat(fullPath);

      if (entryStats.isDirectory()) {
        const result = await collectFiles(fullPath);
        files.push(...result.files);
        count += result.count;
      } else {
        const relativePath = path.relative(localDirPath, fullPath);
        const blobPath = path.join(remoteDirPath, relativePath);
        files.push({ localPath: fullPath, blobPath });
        count++;
      }
    }

    return { files, count };
  }

  // Collect all files and get total count
  const { files: filesToUpload, count: totalFiles } = await collectFiles(localDirPath);
  let filesUploaded = 0;

  const taskRunner = new TaskRunner(concurrency)
  for (const file of filesToUpload) {
    const task = async () => {
      const result = await uploadFileToRemote(file.localPath, file.blobPath);
      results.push(result);
      filesUploaded++;
      onProgress?.(filesUploaded, totalFiles, Math.round((filesUploaded / totalFiles) * 100));
    }
    taskRunner.addTask(task)
  }
  console.log('taskRunner start')
  await taskRunner.run()
  console.log('taskRunner done')

  return results;
}