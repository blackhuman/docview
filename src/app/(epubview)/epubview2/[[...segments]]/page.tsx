import { readBlobFile } from '@/app/actions/blob';
import { createElement } from 'react';
import { renderContent } from '@/app/(epubview)/epubview2/[[...segments]]/renderContent';
import { getPrisma } from '@/app/utils/prisma';
import { redirect } from 'next/navigation';
import { Manifest } from '@/manifest';
import Decorator from './Decorator';

async function loadContent(id: string, path: string) {
  const blobPath = `${id}/${path}`
  console.log('blobPath', blobPath)
  return await readBlobFile(blobPath);
}

async function rawToReactComponent(node: Element) {
  const { tagName, attributes, innerHTML } = node
  return createElement(tagName, attributes, innerHTML)
}
    
async function loadManifest(id: string): Promise<Manifest> {
  const manifestPath = `${id}/manifest.json`;
  const blobContent = await readBlobFile(manifestPath);
  const contentText = await blobContent.text();
  const manifest: Manifest = JSON.parse(contentText);
  return manifest;
}

async function handleDefaultPath(id: string, sections: string[], basePath: string, manifest: Manifest) {
  const prisma = await getPrisma()
  const path = sections.join('/')
  const entry = await prisma.entry.findUnique({ where: { id }})
  if (path === '' && entry?.readingPath) {
    const path = entry.readingPath
    redirect(`/${basePath}/${path}`)
  }
  if (path === '') {
    const index = manifest.toc[0].index
    const path = manifest.spineFiles[index]
    redirect(`/${basePath}/${path}`)
  }
  console.log('render path', path)
  if (path.endsWith('.html')) {
    await prisma.entry.update({
      where: { id },
      data: {
        readingPath: path
      }
    })
  }
}

type Params = Promise<{ segments?: string[] }>

export default async function Page({ params }: { params: Params }) {
  const { segments = [] } = await params;
  const [id, ...sections] = segments
  const path = sections.join('/')
  console.log('segments', segments)

  const basePath = `epubview2/${id}`
  const manifest = await loadManifest(id);
  await handleDefaultPath(id, sections, basePath, manifest)
  
  const contentBlob = await loadContent(id, path);
  // console.log('document', document.documentElement.outerHTML)
  // console.log('document.head.innerHTML', document.head.innerHTML)
  // console.log('document.body.innerHTML', document.body.innerHTML)
  const { head, body } = await renderContent(await contentBlob.text());

  return (
    <>
      <head>
        {head}
      </head>
      <body style={{ width: '60%', height: '100%', margin: '0 auto' }}>
        {body}
        <Decorator manifest={manifest} basePath={basePath} path={path} />
      </body>
    </>
  );
}