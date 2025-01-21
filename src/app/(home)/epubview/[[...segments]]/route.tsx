import { readBlobFile } from '@/app/actions/blob';
import { Manifest } from '@/manifest';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import React from 'react';
import { getPrisma } from '@/app/utils/prisma';
import Decorator from './Decorator';

const { renderToString } = await import('react-dom/server')
    
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
    console.log('start parsing HTML')
    const dom = new JSDOM(await blob.text())
    const document = dom.window.document
    const decorator = <Decorator manifest={manifest} basePath={basePath} path={path} />
    const componentString = renderToString(decorator)
    const componentFragment = document.createRange().createContextualFragment(componentString)
    document.body.appendChild(componentFragment)

    document.body.style.width = '60%'
    document.body.style.height = '100%'
    document.body.style.margin = '0 auto'

    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = '/styles.css'
    document.head.appendChild(style)
    const styleRest = document.createElement('link')
    styleRest.rel = 'stylesheet'
    styleRest.href = '/styles-rest.css'
    document.head.appendChild(styleRest)

    document.querySelectorAll('svg').forEach(svg => {
      svg.setAttribute('preserveAspectRatio', 'xMinYMin')
    })
    const targetBlob = new Blob([document.documentElement.outerHTML], { type: 'text/html' })
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
  console.log('segments in orignal epubview', segments)
  const [id, ...sections] = segments
  console.log('sections', sections);
  const basePath = `epubview/${id}`

  const prisma = await getPrisma()
  const manifest = await loadManifest(id);
  const path = sections.join('/')
  console.log('content path', path)
  const entry = await prisma.entry.findUnique({ where: { id }})
  if (path === '' && entry?.readingPath) {
    const path = entry.readingPath
    console.log('redirect path', path)
    redirect(`/${basePath}/${path}`)
  }
  if (path === '') {
    const index = manifest.toc[0].index
    const path = manifest.spineFiles[index]
    console.log('redirect path', path)
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
  const contentBlob = await loadContent(id, path, manifest);
  return new NextResponse(await decoratePage({ blob: contentBlob, path, manifest, basePath }));

  // if (sections.length > 0) {
    
  // } else {
  //   const manifest = await loadManifest(id);
  //   const index = manifest.toc[0].index
  //   const path = manifest.spineFiles[index]
  //   console.log('redirect path', path)
  //   redirect(`${id}/${path}`)
  // }
}
