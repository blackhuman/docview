'use client'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {Button, Chip} from "@nextui-org/react";

type Params = {
  id: string
}

async function loadHTML(fileName: string): Promise<string> {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}

const HTMLView: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const {id: fileName} = useParams<Params>()
  const router = useRouter()

  useEffect(() => {
    loadHTML(fileName).then(src => setIframeSrc(src))
  }, [fileName])

  return (
    <div className="w-full h-full">
      <Button 
        className="absolute z-10 top-0 left-0"
        onClick={() => router.push('/')}
      >
        Home
      </Button>
      {iframeSrc && <iframe src={iframeSrc} className="w-full h-full"></iframe>}
    </div>
  )
}

export default HTMLView