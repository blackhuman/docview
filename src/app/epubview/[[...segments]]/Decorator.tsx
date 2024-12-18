import '@/app/globals.css'
import { Manifest } from '@/manifest'

interface DecoratorProps {
  manifest: Manifest
  basePath: string
  path: string
}

export async function Decorator(props: DecoratorProps) {
  const {manifest, basePath, path} = props
  // console.log('manifest', manifest)
  console.log('pathname', path)
  const currentIndex = manifest.spineFiles.findIndex(v => v === path)
  const previousIndex = currentIndex - 1
  const previousPath = previousIndex >= 0 ? manifest.spineFiles[previousIndex] : null
  const nextIndex = currentIndex + 1
  const nextPath = nextIndex < manifest.spineFiles.length ? manifest.spineFiles[nextIndex] : null
  return (
    <div className='absolute top-0 left-0 w-0 h-0'>
      <div id='toc' className='fixed top-5 left-2'>TOC</div>
      <a id='previous-page' className='fixed bottom-2 left-2' href={`/${basePath}/${previousPath}` || '#'}>Previous</a>
      <a id='next-page' className='fixed bottom-2 right-2' href={`/${basePath}/${nextPath}` || '#'}>Next</a>
    </div>
  )
}