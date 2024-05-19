'use client';

import { url } from "inspector";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Params = {
  id: string
}

async function loadDocument(fileName: string) {
  console.log(`embed pdf, loadDocument: ${fileName}`)
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}

function Viewer() {
  const [src, setSrc] = useState<string>('')
  const {id: fileName} = useParams<Params>()
  const router = useRouter()

  useEffect(() => {
    loadDocument(decodeURIComponent(fileName)).then(url => setSrc(url))
  }, [fileName])

  return (
    <embed src={src} className="w-full h-full"></embed>
  )
}

export default Viewer