import { getPrisma } from '@/app/utils/prisma';
import { headers } from 'next/headers';
import Link from 'next/link';
import styles from './page.module.css';

type Params = Promise<{ id: string }>

export default async function Page({ params }: { params: Params }) {
  const {id} = await params
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({ where: { id }})
  if (!entry || entry.entryType !== 'HTML' || entry.originalFile === null) {
    throw new Error('Entry not found')
  }
  const baseUrl = 'https://qokvogozqtkoq9ng.public.blob.vercel-storage.com'
  const response = await fetch(`${baseUrl}/${entry.originalFile}`);
  const content = await response.text();

  // const iframeSrc = `/api/file/${entry.originalFile}`
  // console.log('iframeSrc', iframeSrc)

  // const contentSrc = `https://qokvogozqtkoq9ng.public.blob.vercel-storage.com/${entry.originalFile}`
  // const iframeSrcResponse = await fetch(contentSrc)
  // const iframeSrcDocText = await iframeSrcResponse.text()
  // console.log('iframeSrcDocText', iframeSrcDocText.length)

  return (
    <div className='w-full h-full'>
      <Link href="/">Home</Link>
      <div className='flex justify-center'>
        <div className='text-large w-4/5' dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </div>
  )
}
