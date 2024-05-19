'use client';
import { useParams, useRouter } from "next/navigation"
import {Book, Rendition, type NavItem} from 'epubjs'
import { useEffect, useRef, useState } from 'react'

type Params = {
  id: string
}

async function loadFile(fileName: string): Promise<string> {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}

async function loadFileBytes(fileName: string): Promise<File> {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  return await fileHandle.getFile()
}

const Page = () => {
  const {id: fileName} = useParams<Params>()
  const containerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const mountRef = useRef(false)
  const [sections, setSections] = useState<NavItem[]>([])

  useEffect(() => {
    async function load(): Promise<Rendition | null> {
      console.log('load', mountRef.current)
      if (mountRef.current === false) return null
      const file = await loadFileBytes(fileName)
      const bytes = await file.arrayBuffer()
      // @ts-ignore
      const book = new Book(bytes)
      book.loaded.navigation.then(toc => {
        const sections: NavItem[] = []
        toc.forEach(section => {
          sections.push(section)
          console.log(`section, label: ${section.label}, href: ${section.href}`)
          return {}
        })
        setSections(sections)
      })
      const rendition = book.renderTo("epub-render", { 
        width: "100%", height: "100%",
        // layout: "fixed",
        // flow: "paginated",
        // flow: "auto",
        // manager: "continuous",
        // flow: "scrolled",
        flow: "scrolled-doc",
        // flow: "paginated",
        // overflow: ''
        // spread: 'none',
        snap: true,
        allowScriptedContent: true
      })
      rendition.hooks.render.register((view: any) => {
        // const iframe = containerRef.current!.querySelector('iframe')
        view.iframe.referrerPolicy = 'unsafe-url'
      })
      console.log('displayed')
      const displayed = rendition.display()
      // displayed.then(() => {
      //   const siframe = containerRef.current!.querySelector('iframe')
      //   iframe!.referrerPolicy = "no-referrer-when-downgrade"
      //   // iframe!.setAttribute('referrerpolicy', 'no-referrer-when-downgrade')
      //   console.log('iframe', iframe)
      // })
      renditionRef.current = rendition
      return rendition
    }
    console.log('mount start')
    mountRef.current = true
    const renditionLoad = load()
    return () => {
      console.log('unmount')
      mountRef.current = false
      renditionLoad.then((rendition) => {
        rendition?.destroy()
      })
    }
  }, [fileName])

  function onClick() {
    console.log('onClick', sections[3].href)
    renditionRef.current?.display(sections[3].href)
  }

  return (
    <div ref={containerRef} className='w-full h-full'>
        <button onClick={onClick}>Click</button>
        <div id="epub-render" className='w-full h-full'></div>
    </div>
  )
}

export default Page