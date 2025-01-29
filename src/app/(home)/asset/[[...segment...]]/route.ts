import { readBlobFile } from '@/app/actions/blob';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ segments?: string[] }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { segments = [] } = await params;
  console.log('segments', segments)

  const blob = await readBlobFile(segments.join('/'))
  if (!blob) {
    return NextResponse.next()
  }

  if (blob.type !== 'application/xhtml+xml' && blob.type !== 'text/html') {
    return blob
  }

  return new NextResponse(blob)
}