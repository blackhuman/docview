'use client';
import dynamic from 'next/dynamic'
import { useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react'
import EmbedPDFViewer from './EmbedPDFViewer'

const PSPDFViewer = dynamic(() => import('./PSPDFViewer'), {ssr: false})
const PDFJSViewer = dynamic(() => import('./PDFJSViewer'), {ssr: false})
type PDFRenderMode = 'pspdf' | 'pdfjs' | 'embed'

export default function Page() {
  const [renderMode, setRenderMode] = useState<PDFRenderMode>('embed')
  const renderModeCandidate = ['pspdf', 'pdfjs', 'embed']

  return (
    <div className="w-full h-full">
      <Select
        label="Select PDF Render" 
        className="absolute z-10 top-0 left-auto right-0 max-w-xs" 
        selectedKeys={[renderMode]}
        onChange={(e) => setRenderMode(e.target.value as PDFRenderMode)}
      >
        {renderModeCandidate.map((renderMode) => (
          <SelectItem key={renderMode} value={renderMode}>
            {renderMode}
          </SelectItem>
        ))}
      </Select>
      {renderMode === 'pspdf' && <PSPDFViewer />}
      {renderMode === 'pdfjs' && <PDFJSViewer />}
      {renderMode === 'embed' && <EmbedPDFViewer />}
    </div>
  )
}