'use server'

import { head } from '@vercel/blob'

export async function readBlobFile(url: string) {
  try {
    const blob = await head(url)
    
    if (!blob) {
      throw new Error('Blob not found')
    }

    const response = await fetch(blob.url)
    if (!response.ok) {
      throw new Error('Failed to fetch blob content')
    }

    const content = await response.blob()
    return content

  } catch (error) {
    console.error('Error reading blob file:', error)
    throw error
  }
}
