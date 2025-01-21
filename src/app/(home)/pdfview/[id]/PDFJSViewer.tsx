'use client';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import {PDFViewer, EventBus} from 'pdfjs-dist/web/pdf_viewer.mjs'
import { EffectCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@nextui-org/react'
import 'pdfjs-dist/web/pdf_viewer.css'

type Params = {
  id: string
}

async function loadDocument(fileName: string) {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  const content = await file.arrayBuffer()
  return getDocument(content).promise
}

type UseAsyncResult<T> = {
  state: 'loading' | 'success' | 'error'
  value: T | null
  error: any | null
}

function useAsync<T>(callback: () => Promise<T>): UseAsyncResult<T> {
  const [state, setState] = useState<UseAsyncResult<T>>({
    state: 'loading',
    value: null,
    error: null,
  })

  useEffect(() => {
    callback().then(
      value => setState({state: 'success', value, error: null}),
      error => setState({state: 'error', value: null, error}),
    )
  }, [callback])

  return state

}

export function useOnMountUnsafe(effect: EffectCallback, ...deps: any[]) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      effect()
    }
  }, [effect, deps])
}

const Viewer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pdfViewerRef = useRef<PDFViewer | null>(null)
  const {id: fileName} = useParams<Params>()
  const router = useRouter()
  // const documentState = useAsync(() => loadDocument(fileName))

  useOnMountUnsafe(() => {
    if (containerRef.current === null) return
    console.log('containerRef.current', containerRef.current)

    const eventBus = new EventBus();
    const pdfViewer = new PDFViewer({
      container: containerRef.current,
      // viewer: containerRef.current,
      eventBus,
    })
    pdfViewerRef.current = pdfViewer
    GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'
    
    loadDocument(fileName).then(doc => {
      pdfViewer.setDocument(doc)
      console.log('load pdfDocument')
    })
    // return () => {
    //   pdfViewer.pdfDocument?.destroy()
    //   console.log('destroy pdfDocument')
    // }
  }, [fileName])

  return (
    <div className='w-full h-full'>
      <Button 
        onClick={() => router.push('/')}
        className='absolute z-10 top-0 left-0'>Home</Button>
      <div id='pdfjs-container' ref={containerRef} 
        className='w-full h-full absolute overflow-auto'>
          <div id="viewer" className="pdfViewer"></div>
      </div>
    </div>
  )
}

export default Viewer