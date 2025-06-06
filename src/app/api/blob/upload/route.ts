import { processEpubFileForUser } from '@/app/actions/process-epub';
import { createClient, getUserId } from '@/app/utils/supabase/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const epubFileUrl = searchParams.get('testEpubFileUrl');
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ success: false }) 
  }
  if (epubFileUrl) {
    // for quick testing
    await processEpubFileForUser(userId, 'abc')
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
          // allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/epub+zip'],
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

        // console.log('blob upload completed', blob, tokenPayload);
        // await processEpubFile(blob.downloadUrl, 'abc')
        // console.log('processEpubFile completed')

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
    console.error('file upload error', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}