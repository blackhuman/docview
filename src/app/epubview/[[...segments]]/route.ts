import { readBlobFile } from '@/app/actions/blob';
import { Manifest } from '@/manifest';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

async function loadManifest(id: string): Promise<Manifest> {
  const manifestPath = `${id}/manifest.json`;
  const blobContent = await readBlobFile(manifestPath);
  const contentText = await blobContent.text();
  const manifest: Manifest = JSON.parse(contentText);
  return manifest;
}

async function loadContent(id: string, path: string, manifest: Manifest) {
  const blobPath = `${id}/${path}`
  console.log('blobPath', blobPath)
  return await readBlobFile(blobPath);
}

type Params = Promise<{ segments?: string[] }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { segments = [] } = await params;
  console.log('segments', segments)
  const [id, ...sections] = segments
  console.log('sections', sections);

  if (sections.length > 0) {
    try {
      const manifest = await loadManifest(id);
      const path = sections.join('/')
      console.log('content path', path)
      const contentBlob = await loadContent(id, path, manifest);
      return new NextResponse(contentBlob);
    } catch (error) {
      console.error(error);
      return new NextResponse('Not Found', { status: 404 });
    }
  } else {
    const manifest = await loadManifest(id);
    const index = manifest.toc[0].index
    const path = manifest.spineFiles[index]
    console.log('redirect path', path)
    redirect(`${id}/${path}`)
  }
}
