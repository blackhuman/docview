'use client';
import { DragEventHandler, DragEvent, PropsWithChildren, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {Button, Chip} from "@nextui-org/react";

async function fileExisted(fileName: string): Promise<boolean> {
  try {
    const rootDir = await navigator.storage.getDirectory()
    await rootDir.getFileHandle(fileName, { create: false })
    return true
  } catch (e) {
    return false
  }
}

async function getValidateFileName(fileName: string): Promise<string> {
  const fileNameSplitIndex = fileName.lastIndexOf('.')
  let fileNameBase = fileName
  let fileNameExt = ''
  if (fileNameSplitIndex !== -1) {
    fileNameBase = fileName.slice(0, fileNameSplitIndex)
    fileNameExt = fileName.slice(fileNameSplitIndex)
  }

  let validateFileNameBase = fileNameBase
  let index = 1
  while (await fileExisted(`${validateFileNameBase}${fileNameExt}`)) {
    validateFileNameBase = `${fileNameBase}-${index}`
    index += 1
  }
  return `${validateFileNameBase}${fileNameExt}`
}

type FileType = 'pdf' | 'html' | 'epub'

function getFileExt(fileName: string): FileType | null {
  const fileNameSplitIndex = fileName.lastIndexOf('.')
  if (fileNameSplitIndex === -1) return null
  return fileName.slice(fileNameSplitIndex + 1) as FileType
}

export default function Home({children}: PropsWithChildren) {
  const [files, setFiles] = useState<string[]>([])

  const updateFiles = useCallback(async () => {
    const rootDir = await navigator.storage.getDirectory()
    const files = []
    // @ts-ignore
    for await (const [fileName, fileHandle] of rootDir.entries()) {
      files.push(fileName)
      console.log('fileName', fileName)
    }
    setFiles(files)
  }, [])

  useEffect(() => {
    console.log('init updateFiles')
    updateFiles()
  }, [updateFiles])

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(async (event) => {
    event.preventDefault()
    console.log('onDrop')
    for (const item of event.dataTransfer.items) {
      const file = item.getAsFile()!
      console.log('file.name', file.name)
      const validateFileName = await getValidateFileName(file.name)
      const rootDir = await navigator.storage.getDirectory()
      const fileHandle = await rootDir.getFileHandle(validateFileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(file)
      await writable.close()
    }
    updateFiles()
  }, [updateFiles])

  async function deleteFile(fileName: string) {
    console.log('deleteFile', fileName)
    const rootDir = await navigator.storage.getDirectory()
    await rootDir.removeEntry(fileName, { recursive: false })
    await updateFiles()
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div 
      onDrop={onDrop} 
      onDragOver={onDragOver} 
      className='w-full h-full grid grid-cols-5'>
      {
        files.map((file, index) => {
          const fileExt = getFileExt(file)
          if (fileExt === null) return null
          let link: React.ReactElement | null = null
          switch(fileExt) {
            case 'pdf':
              link = (
                <Link href={`/pdfview/${file}`}>
                  {file}
                  <Chip color="primary">PDF</Chip>
                </Link>
              )
              break
            case 'html':
              link = (
                <Link href={`/htmlview/${file}`}>
                  {file}
                  <Chip color="secondary">HTML</Chip>
                </Link>
              )
              break
            case 'epub':
              link = (
                <Link href={`/ebookview/${file}`}>
                  {file}
                  <Chip color="secondary">EPUB</Chip>
                </Link>
              )
              break
          }
          return (
            <div key={index}>
              {link}
              <Button onClick={() => deleteFile(file)}>Delete</Button>
            </div>
          )
        }).filter(v => v !== null)
      }
    </div>
  );
}
