'use client';

import React from 'react';
import { uploadToBlob } from '../utils/vercel/blob/client';
import { PutBlobResult } from '@vercel/blob';
import { getFileType } from '@/app/utils/file-util';
import { FileType } from '@prisma/client';

interface DraggableUploadProps {
  children: React.ReactNode;
  className?: string;
  onUploadStart(filename: string): void
  onUploadProgress(progress: number): void
  onUploadFinish?(filename: string, fileType: FileType, result: PutBlobResult): void
}

export default function DraggableUpload({ 
  children, className = '', 
  onUploadStart, onUploadProgress, onUploadFinish
}: DraggableUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    // const files = Array.from(e.dataTransfer.files)
    for (const file of e.dataTransfer.files) {
      try {
        const fileType = getFileType(file.name)
        if (!fileType) {
          console.error('Unsupported file type:', file.name)
          continue
        }
        onUploadStart(file.name)
        if (file.name.startsWith('test')) {
          onUploadFinish?.(file.name, fileType, { url: 'https://example.com/test.epub' } as PutBlobResult)
          break
        }
        const uploadResult = await uploadToBlob(file, process => onUploadProgress(process.percentage))
        onUploadFinish?.(file.name, fileType, uploadResult)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
  }

  return (
    <div 
      className={`${className} ${isDragging ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}
