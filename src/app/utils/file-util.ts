import { FileType } from '@prisma/client'

export function getFileType(filename: string): FileType | undefined {
  const ext = filename.split('.').pop()
  if (!ext) return undefined
  if (ext === 'epub') return 'EPUB'
  if (ext === 'mp3') return 'AUDIO'
  return undefined
}