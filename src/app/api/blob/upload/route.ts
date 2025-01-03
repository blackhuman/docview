import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import fs from 'fs/promises'
import path from 'path'
import { processEpub } from '@/app/utils/parse-epub';
import { downloadFileStream } from '@/app/utils/download';
import AdmZip from 'adm-zip';
import { uploadBlobToRemote, uploadFolderToRemote } from '@/app/utils/vercel/blob/server';

export async function POST(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const epubFileUrl = searchParams.get('testEpubFileUrl');
  if (epubFileUrl) {
    // for quick testing
    await processEpubFile(epubFileUrl, 'abc')
    return NextResponse.json({ success: true })
  }
  const body = (await request.json()) as HandleUploadBody;
  console.log('body', body);
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/epub+zip'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a value from clientPayload
          }),
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);
        await processEpubFile(blob.downloadUrl, 'abc')
        console.log('processEpubFile completed')

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}

async function processEpubFile(epubFileUrl: string, remoteDirPath: string) {

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
  });

  // process epub
  const manifest = await processEpub(epubPath, outputPath);
  await uploadBlobToRemote(
    JSON.stringify(manifest),
    remoteDirPath + '/manifest.json'
  )

  // cleanup
  await fs.rm(tempDir, { recursive: true, force: true });

}