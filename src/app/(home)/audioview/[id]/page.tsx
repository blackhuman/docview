import { readBlobFile } from '@/app/actions/blob';
import { SyncPrerecordedResponse } from '@deepgram/sdk';
import { Button } from '@nextui-org/react';
import { channel } from 'diagnostics_channel';
import { ReadingView } from './ReadingView';
import { Manifest } from './type';
import { getPrisma } from '@/app/utils/prisma';

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const manifest = await loadManifest(id)
  return (
    <>
      <ReadingView manifest={manifest} />
      <div id='debug'></div>
    </>
  )
}

async function loadManifest(id: string): Promise<Manifest> {
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({ where: { id }})
  if (!entry || entry.entryType !== 'AUDIO' || entry.originalFile === null) {
    throw new Error('Entry not found')
  }
  const manifestPath = `${id}/manifest.json`;
  const blobContent = await readBlobFile(manifestPath);
  const contentText = await blobContent.text();
  const manifest: SyncPrerecordedResponse = JSON.parse(contentText);
  return {
    url: entry.originalFile,
    data: manifest
  };
}