'use client';
import { DragEventHandler, DragEvent, PropsWithChildren, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {Button, ButtonGroup} from "@nextui-org/react";

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
    <div onDrop={onDrop} onDragOver={onDragOver} className='w-full h-full'>
      {
        files.map((file, index) => (
          <div key={index}>
            <Link href={`/pdfview/${file}`}>{file}</Link>
            <Button onClick={() => deleteFile(file)}>Delete</Button>
          </div>
        ))
      }
    </div>
  );
}
