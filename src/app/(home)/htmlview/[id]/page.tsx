import { getPrisma } from '@/app/utils/prisma';
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

  return (
    <div className="w-full h-full">
      <Link href="/">Home</Link>
      {iframeSrc && 
        <iframe 
          src={iframeSrc} 
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          referrerPolicy="no-referrer"
          allow="fullscreen"
        ></iframe>}
    </div>
  )
}
