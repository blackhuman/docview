import { readBlobFile } from '@/app/actions/blob';
import { Manifest } from '@/manifest';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { parseHTML } from 'linkedom';
import React from 'react';
import { Decorator } from './Decorator';

const ReactDOMServer = (await import('react-dom/server')).default

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

async function decoratePage({ blob, path, manifest, basePath }: {
  blob: Blob, 
  basePath: string,
  path: string, 
  manifest: Manifest
}) {
  if (blob.type !== 'application/xhtml+xml' && blob.type !== 'text/html') {
    return blob
  }

  try {
    const {
      // note, these are *not* globals
      window, document, customElements,
      HTMLElement,
      Event, CustomEvent
      // other exports ..
    } = parseHTML(await blob.text())

    const decorator = await Decorator({ manifest, basePath, path })
    const componentString = ReactDOMServer.renderToStaticMarkup(decorator)
    const componentFragment = document.createRange().createContextualFragment(componentString)
    document.body.appendChild(componentFragment)

    document.body.style.width = '80%'
    document.body.style.height = '100%'
    document.body.style.margin = '0 auto'
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = '/styles.css'
    document.head.appendChild(style)
    document.querySelectorAll('svg').forEach(svg => {
      svg.setAttribute('preserveAspectRatio', 'xMinYMin')
    })
    // console.log('document', document.toString())
    const targetBlob = new Blob([document.toString()], { type: 'text/html' })
    // console.log('targetBlob', await targetBlob.text())
    return targetBlob
  } catch (error) {
    console.error('Error parsing HTML:', error)
  }
  return blob
    
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
      return new NextResponse(await decoratePage({ blob: contentBlob, path, manifest, basePath: `epubview/${id}` }));
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
