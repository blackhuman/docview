import { getPrisma } from '@/app/utils/prisma';
import { headers } from 'next/headers';
import Link from 'next/link';

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const {id} = await params
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({ where: { id }})
  if (!entry || entry.entryType !== 'HTML' || entry.originalFile === null) {
    throw new Error('Entry not found')
  }
  const iframeSrc = `/api/file/${entry.originalFile}`
  console.log('iframeSrc', iframeSrc)

  // const contentSrc = `https://qokvogozqtkoq9ng.public.blob.vercel-storage.com/${entry.originalFile}`
  // const iframeSrcResponse = await fetch(contentSrc)
  // const iframeSrcDocText = await iframeSrcResponse.text()
  // console.log('iframeSrcDocText', iframeSrcDocText.length)

  return (
    <div className="w-full h-full">
      <Link href="/">Home</Link>
      {iframeSrc && 
        <iframe 
          src={iframeSrc}
          // srcDoc={iframeSrcDocText} 
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          referrerPolicy="no-referrer"
          allow="fullscreen"
        ></iframe>}
    </div>
  )
}
