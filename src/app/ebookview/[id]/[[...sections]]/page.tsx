'use client';
import { useParams, useRouter } from "next/navigation"
import {Book, Rendition, type NavItem} from 'epubjs'
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import Link from "next/link";
import {  Listbox,  ListboxSection,  ListboxItem} from "@nextui-org/listbox";
import { Button } from "@nextui-org/react";

type Params = {
  id: string
  sections?: string[]
}

async function loadFile(fileName: string): Promise<string> {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}

async function loadFileBytes(fileName: string): Promise<File> {
  fileName = decodeURIComponent(fileName)
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  return await fileHandle.getFile()
}

const Page = () => {
  const {id: fileName, sections} = useParams<Params>()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const mountRef = useRef(false)
  const [sectionToc, setSectionToc] = useState<NavItem[]>([])
  const currentSection = useMemo(() => sections !== undefined ? sections.join('/') : null, [sections])

  useEffect(() => {
    async function load(): Promise<Rendition | null> {
      console.log('load', mountRef.current) 
      const file = await loadFileBytes(fileName)
      const bytes = await file.arrayBuffer()
      console.log(`file size: ${bytes.byteLength/1000/1000}MB`)
      // @ts-ignore
      const book = new Book(bytes)
      book.loaded.navigation.then(toc => {
        const sections: NavItem[] = []
        toc.forEach(sectionItem => {
          sections.push(sectionItem)
          console.log(`section, label: ${sectionItem.label}, href: ${sectionItem.href}`)
          return {}
        })
        setSectionToc(sections)
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
      rendition.themes.fontSize('140%')
      rendition.themes.override('padding', '0px')
      rendition.themes.default({
        p: {
          'margin': '10px !important',
          'line-height': '1.5 !important',
        }
      })
      rendition.hooks.render.register((view: any) => {
        // view.iframe.referrerPolicy = 'unsafe-url'
        // const document = view.document as Document
        // document.body.style.padding = '0px'
      })
      console.log('displayed', currentSection)
      const displayed = currentSection !== null 
        ? rendition.display(currentSection) 
        : rendition.display()
      renditionRef.current = rendition
      return rendition
    }
    console.log('mount start. fileName:', fileName)
    mountRef.current = true
    const renditionLoad = load()
    return () => {
      console.log('unmount')
      renditionLoad.then((rendition) => {
        rendition?.destroy()
      })
    }
  }, [currentSection, fileName])

  return (
    <div ref={containerRef} className='w-full h-full flex flex-row'>
      <div className='basis-1/6 flex flex-col p-3 h-full'>
        <div className='w-full'>
          <Button className='w-full' onClick={() => router.push('/')}>Home</Button>
        </div>
        {
          <ListboxWrapper>
            <Listbox aria-label="Actions">
              {[
                (
                <ListboxItem key='cover' >
                  <Link
                    href={`/ebookview/${fileName}`}>
                    Cover
                  </Link>
                </ListboxItem>
                ),
                ...sectionToc.map(sectionItem => (
                  <ListboxItem key={sectionItem.href} textValue={sectionItem.label} >
                    <Link
                      href={`/ebookview/${fileName}/${sectionItem.href}`}>
                      {sectionItem.label}
                    </Link>
                  </ListboxItem>
                ))
              ]}
            </Listbox>
          </ListboxWrapper>
        }
      </div>
      <div id="epub-render" className='w-full h-full'></div>
    </div>
  )
}

const ListboxWrapper: React.FC<PropsWithChildren> = ({children}) => (
  <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mt-2 overflow-y-scroll">
    {children}
  </div>
);

export default Page

export const runtime = 'edge'
