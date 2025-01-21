import '@/app/globals.css'
import { Manifest } from '@/manifest'
import { range } from 'es-toolkit'

interface DecoratorProps {
  manifest: Manifest
  basePath: string
  path: string
}

export default function Decorator(props: DecoratorProps) {
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
      <a className='fixed top-2 left-2' href='/'>Home</a>
      <ul id='toc' className='fixed top-5 left-2 list-none p-0 m-0 flex flex-col items-start overflow-y-scroll toc'>
        {manifest.toc.map(tocItem => {
          const indexRange = range(tocItem.indexRange[0], tocItem.indexRange[1] + 1)
          const firstIndex = indexRange.shift()!
          return (
            <li key={tocItem.index} className='mb-2 flex flex-col items-start'>
              <a href={`/${basePath}/${manifest.spineFiles[firstIndex]}`} className='text-blue-500 hover:text-blue-700'>
                {tocItem.name}
              </a>
              {indexRange.length > 0 && (
                <ul className='list-none p-0 ml-2 flex flex-col items-start'>
                  {indexRange.map(index => (
                    <li key={index}>
                      <a href={`/${basePath}/${manifest.spineFiles[index]}`} className='text-blue-500 hover:text-blue-700'>
                        {manifest.spineFiles[index].split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      <a id='previous-page' className='fixed bottom-2 left-2' href={`/${basePath}/${previousPath}` || '#'}>Previous</a>
      <a id='next-page' className='fixed bottom-2 right-2' href={`/${basePath}/${nextPath}` || '#'}>Next</a>
    </div>
  )
}