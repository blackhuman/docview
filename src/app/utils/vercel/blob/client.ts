import { OnUploadProgressCallback, PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';

const tempPath = '/tmp'

export async function uploadToBlob(file: File, onUploadProgress: OnUploadProgressCallback): Promise<PutBlobResult> {
  console.log('file.name', file.name)
  const uploadResult = await upload(tempPath + '/' + file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    onUploadProgress,
  })
  console.log('uploadResult', uploadResult)
  return uploadResult
}