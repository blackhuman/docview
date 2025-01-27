import { readBlobFile } from '@/app/actions/blob';
import { SyncPrerecordedResponse } from '@deepgram/sdk';

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const manifest = await loadManifest(id)
  return (
    <div>
      {JSON.stringify(manifest)}
    </div>
  )
}

async function loadManifest(id: string): Promise<SyncPrerecordedResponse> {
  const manifestPath = `${id}/manifest.json`;
  const blobContent = await readBlobFile(manifestPath);
  const contentText = await blobContent.text();
  const manifest: SyncPrerecordedResponse = JSON.parse(contentText);
  return manifest;
}