import { put, PutBlobResult } from '@vercel/blob';
import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

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
 * Upload all files in a directory to Vercel Blob
 * @param localDirPath Directory path to upload
 * @param onProgress Optional callback for upload progress (filesUploaded, totalFiles, percent)
 * @returns Array of upload results
 */
export async function uploadFolderToRemote(
  localDirPath: string,
  remoteDirPath: string,
  onProgress?: (filesUploaded: number, totalFiles: number, percent: number) => void
): Promise<PutBlobResult[]> {
  const results: PutBlobResult[] = [];
  
  // Verify directory exists
  const stats = await stat(localDirPath);
  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${localDirPath}`);
  }

  // Count total files first
  async function countFiles(dir: string): Promise<number> {
    let count = 0;
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const entryStats = await stat(fullPath);
      
      if (entryStats.isDirectory()) {
        count += await countFiles(fullPath);
      } else {
        count++;
      }
    }
    
    return count;
  }

  const totalFiles = await countFiles(localDirPath);
  let filesUploaded = 0;

  async function uploadFiles(dirPath: string): Promise<PutBlobResult[]> {
    const localResults: PutBlobResult[] = [];
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryStats = await stat(fullPath);

      if (entryStats.isDirectory()) {
        // Recursively upload subdirectory
        const subResults = await uploadFiles(fullPath);
        localResults.push(...subResults);
      } else {
        // Calculate relative path and final blob path
        const relativePath = path.relative(localDirPath, fullPath);
        const blobPath = path.join(remoteDirPath, relativePath);
        
        // Upload file with the calculated blob path
        const blob = await uploadFileToRemote(fullPath, blobPath);
        localResults.push(blob);
        filesUploaded++;
        onProgress?.(filesUploaded, totalFiles, Math.round((filesUploaded / totalFiles) * 100));
      }
    }

    return localResults;
  }

  results.push(...await uploadFiles(localDirPath));
  return results;
}